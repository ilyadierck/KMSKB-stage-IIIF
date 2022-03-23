from flask import Flask, request
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import pandas as pd
import ast
import json

app = Flask(__name__)
CORS(app)
api = Api(app)

storage = {}

class Annotation(Resource):
    def post(self):
        content = request.json
        content = json.loads(json.dumps(content))
        id = content.get('id')
        storage[id] = content
        return content

    def get(self):
        return storage

    def delete(self):
        content = request.json
        content = json.loads(json.dumps(content))
        id = content.get('id')
        storage[id] = content
    
    def patch(self):
        content = request.json
        content = json.loads(json.dumps(content))
        id = content.get('id')
        storage[id] = content

api.add_resource(Annotation, '/annotations') 

if __name__ == '__main__':
    app.run()  # run our Flask app