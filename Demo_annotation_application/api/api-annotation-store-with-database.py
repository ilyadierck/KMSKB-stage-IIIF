from email.mime import base
from flask import Flask, request
from flask_restful import Resource, Api, reqparse
import mysql.connector
from flask_cors import CORS
import json
import databaseconfig as cfg

app = Flask(__name__)
CORS(app)
api = Api(app)

mydb = mysql.connector.connect(
    host= cfg.mysql["host"],
    user= cfg.mysql["user"],
    password= cfg.mysql["passwd"],
    database= cfg.mysql["db"]
)
    
def resultToDict(result):
    store = {}
    for annotation in result:
        store[annotation[0]] = annotation[1]
    return store

class Annotation(Resource):
    def post(self):
        content = request.json
        content = json.loads(json.dumps(content))
        id = content.get('id')

        mycursor = mydb.cursor()
        sql = "INSERT INTO annotations (id, annotation_page) VALUES (%s, %s)"
        val = (id, json.dumps(content))
        mycursor.execute(sql, val)
        mydb.commit()

        return content

    def get(self):
        mycursor = mydb.cursor()
        mycursor.execute("SELECT * FROM annotations")
        res = mycursor.fetchall()
        return resultToDict(res)

    def patch(self):
        content = request.json
        content = json.loads(json.dumps(content))
        id = content.get('id')

        mycursor = mydb.cursor()
        sql = "UPDATE annotations SET annotation_page = %s WHERE id = %s"
        val = (json.dumps(content), id)
        mycursor.execute(sql, val)
        mydb.commit()
    
    def delete(self):
        Annotation.patch(self)

class Authors(Resource):
    authorId = None

    def get(self):
        if self.authorId == None:
            parser = reqparse.RequestParser()
            parser.add_argument('id', type=int)
            args = parser.parse_args()
            self.authorId = args.id
        mycursor = mydb.cursor()
        sql = "SELECT * FROM authors WHERE creatorAuthID = %s"
        val = (self.authorId,)
        mycursor.execute(sql, val)
        res = mycursor.fetchall()
        return res
    
    def post(self, json):
        mycursor = mydb.cursor()
        sql = "INSERT INTO authors (name, birthdate, deathdate, creatorAuthID) VALUES (%s,%s,%s,%s)"
        val = (json["name"], json["birthdate"], json["deathdate"], json["creatorAuthID"])
        mycursor.execute(sql, val)
        mydb.commit()

class Resources(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=str)
        parser.add_argument('authorName', type=str)
        parser.add_argument('authorBirthdate', type=str)
        parser.add_argument('authorDeathdate', type=str)
        parser.add_argument('creationYear', type=str)
        parser.add_argument('description', type=str)
        args = parser.parse_args()

        endResourceSql = "SELECT * FROM resources WHERE "
        filler = ""
        if args["id"] != None and args["id"] != "":
            endResourceSql = endResourceSql + filler + "id='" + args["id"] + "'"
            filler = " AND "
        if args["creationYear"] != None and args["creationYear"] != "":
            endResourceSql = endResourceSql + filler + "creationYear='" + args["creationYear"] + "'"
            filler = " AND "
        if args["description"] != None and args["description"] != "":
            endResourceSql = endResourceSql + filler + "description LIKE '%" + args["description"] + "%'"
            filler = " AND "

        endAuthorSql = "SELECT id FROM authors WHERE "
        filler = ""
        if args["authorName"] != None and args["authorName"] != "":
            endAuthorSql = endAuthorSql + filler + "name LIKE '%" + args["authorName"] + "%'"
            filler = " AND "
        if args["authorBirthdate"] != None and args["authorBirthdate"] != "":
            endAuthorSql = endAuthorSql + filler + "birthdate='" + args["authorBirthdate"] + "'"
            filler = " AND "
        if args["authorDeathdate"] != None and args["authorDeathdate"] != "":
            endAuthorSql = endAuthorSql + filler + "deathdate='" + args["authorDeathdate"] + "'"
            filler = " AND "

        mycursor = mydb.cursor()

        if filler != "":
            endResourceSql += filler + "authorId in (" +  endAuthorSql + ")"

        print(endResourceSql)
        mycursor.execute(endResourceSql)
        return mycursor.fetchall()
    
    def post(self):
        content = request.json
        content = json.loads(json.dumps(content))
        mycursor = mydb.cursor()
        
        self.authorId = content["metadata"]["Author"]["creatorAuthID"]
        foundAuthor = Authors.get(self)
        if (len(foundAuthor) == 0):
            Authors.post(self, content["metadata"]["Author"])
            foundAuthor = Authors.get(self)

        print(foundAuthor)
        sql = "INSERT INTO resources (id, authorId, description, creationYear, imageLink) VALUES (%s, %s, %s, %s, %s)"
        val = (str(content["id"]), foundAuthor[0][0], content["metadata"]["Description"], content["metadata"]["CreationYear"], content["metadata"]["ImageLink"])
        mycursor.execute(sql, val)
        mydb.commit()


        
api.add_resource(Annotation, '/annotations') 
api.add_resource(Resources, '/resources') 
api.add_resource(Authors, '/authors') 

if __name__ == '__main__':
    app.run()  # run our Flask app