from email.mime import base
from flask import Flask, request
from flask_restful import Resource, Api, reqparse
import mysql.connector
from flask_cors import CORS
import json
import databaseconfig as cfg
import os
import requests
import yaml
import shutil

app = Flask(__name__)
CORS(app)
api = Api(app)

BIIIF_PATH = "biiif-npm-version/paintings/"
WEBSERVER_URL = "http://127.0.0.1:8887/biiif-npm-version/paintings/"
FABRITIUS_BASE_URL = "http://www.opac-fabritius.be"

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

def setupIIIFStructure(image_link, resource_dict):
    resource_dict["label"] = resource_dict["label"].replace("/", "")
    biiifPath = BIIIF_PATH + resource_dict["label"]
    biiifPath = biiifPath.replace(" ", "")
    if (os.path.exists(biiifPath)):
        return "http://127.0.0.1:8887/biiif-npm-version/paintings/" + resource_dict["label"] + "/index.json"
    r = requests.get(image_link, stream = True, timeout=5)
    
    if r.status_code == 200:
        r.raw.decode_content = True
        
        image_name = image_link.split("/")[-1]

        if not os.path.exists(biiifPath):
            os.mkdir(biiifPath)

        with open(biiifPath + "/" + image_name,'wb') as f:
            shutil.copyfileobj(r.raw, f)
        
        ymlPath = biiifPath+ "/"+ 'info.yml'
        with open(ymlPath, 'w') as file:
            yaml.dump(resource_dict, file)

        os.system("biiif " + biiifPath + " -u http://127.0.0.1:8887/biiif-npm-version/paintings/" + biiifPath.split("/")[-1])
        

        return "http://127.0.0.1:8887/biiif-npm-version/paintings/" + resource_dict["label"] + "/index.json"
    else:
        print('Unable to download image')

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
        mycursor.close()
        return content

    def get(self):
        mycursor = mydb.cursor()
        mycursor.execute("SELECT * FROM annotations")
        res = mycursor.fetchall()
        mycursor.close()
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
        mycursor.close()
    
    def delete(self):
        Annotation.patch(self)

class Authors(Resource):
    authorId = None

    def get(self):
        if self.authorId == None:
            sql = "SELECT * FROM authors"
            val = ()
        else:
            sql = "SELECT * FROM authors WHERE creatorAuthID = %s"
            val = (self.authorId,)
        mycursor = mydb.cursor()
        
        mycursor.execute(sql, val)
        res = mycursor.fetchall()
        mycursor.close()
        self.authorId = None
        return res
    
    def post(self, json):
        mycursor = mydb.cursor()
        sql = "INSERT INTO authors (name, birthdate, deathdate, creatorAuthID) VALUES (%s,%s,%s,%s)"
        val = (json["name"], json["birthdate"], json["deathdate"], json["creatorAuthID"])
        mycursor.execute(sql, val)
        mydb.commit()
        mycursor.close()

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

        endResourceSql = "SELECT * FROM resources"
        filler = " WHERE "
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
            endResourceSql += " WHERE authorId in (" +  endAuthorSql + ")"

        mycursor.execute(endResourceSql)
        res = mycursor.fetchall()
        mycursor.close()
        return res
    
    def post(self):
        content = request.json
        content = json.loads(json.dumps(content))
        mycursor = mydb.cursor()
        
        self.authorId = content["metadata"]["Author"]["creatorAuthID"]
        foundAuthor = Authors.get(self)
        if (len(foundAuthor) == 0):
            Authors.post(self, content["metadata"]["Author"])
            foundAuthor = Authors.get(self)

        sql = "INSERT INTO resources (id, authorId, description, creationYear, imageLink) VALUES (%s, %s, %s, %s, %s)"
        val = (str(content["id"]), foundAuthor[0][0], content["metadata"]["Description"], content["metadata"]["CreationYear"], content["metadata"]["ImageLink"])
        mycursor.execute(sql, val)
        mydb.commit()
        mycursor.close()

class IIIF(Resource):
    def post(self):
        content = request.json
        content = json.loads(json.dumps(content))
        author = content["author"]
        resource = content["resource"]

        resource_final_dict = {
        "label": resource[0] + "-" + author[1],
        "metadata" : {
            "Description": resource[2],
            "Author": author[1] + " (" + author[2] + "-" + author[3] + ")",
            "Creation year": resource[3]
            }
        }
        return setupIIIFStructure(resource[4], resource_final_dict)
        
api.add_resource(Annotation, '/annotations') 
api.add_resource(Resources, '/resources') 
api.add_resource(Authors, '/authors') 
api.add_resource(IIIF, '/iiif') 

if __name__ == '__main__':
    app.run()  # run our Flask app