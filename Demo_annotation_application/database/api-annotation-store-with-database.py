from flask import Flask, request
from flask_restful import Resource, Api
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
            

api.add_resource(Annotation, '/annotations') 

if __name__ == '__main__':
    app.run()  # run our Flask app