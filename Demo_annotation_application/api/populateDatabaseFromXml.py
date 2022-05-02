from pyclbr import Function
from unittest import skip
import xml.etree.ElementTree as ET
import yaml
import requests
import shutil
import os
import time

XML_PATH = "database-dump.xml"
API_URL = "http://127.0.0.1:5000/"
 
tree = ET.parse(XML_PATH)
root = tree.getroot()
#test_element = list(root)[0]

def renderKey(key):
    if key in element_dict:
        return element_dict[key]
    else:
        return ""

def renderDescription():
    if "ObjectWorkType" in element_dict:
        description = element_dict["termClassification"] + "\n" + element_dict["ObjectWorkType"]
    else:
        description = renderKey("termClassification")
        return description


def renderAuthor():
    author = {
        "name": "unknown",
        "birthdate": "unknown",
        "deathdate": "unknown"
    }
    if "creatorDescription" in element_dict:
        author["name"] = element_dict["creatorDescription"]
    elif "birthDateCreator" in element_dict and "deathDateCreator" in element_dict:
        author["birthdate"] = element_dict["birthDateCreator"]
        author["deathdate"] = element_dict["deathDateCreator"]
    
    author["creatorAuthID"] = renderKey("creatorAuthID")

    return author


for element in list(root):
    element_dict = {}
    for child_element in element.iter():
        element_dict[child_element.tag] = str(child_element.text)

    if 'imageIntranetLink' not in element_dict or 'workID' not in element_dict:
        continue

    image_name = element_dict['imageIntranetLink'].split("/")[-1]

    element_final_dict = {
        "label": element_dict["workID"] + "-" + image_name.split("-")[0],
        "id": element_dict["workID"],
        "attribution": renderKey("copyrightStatement"),
        "metadata" : {
            "OwnedBy": renderKey("legalStatus"),
            "Description": renderDescription(),
            "Author": renderAuthor(),
            "CreationYear": renderKey("latestDate"),
            "ImageLink": "http://www.opac-fabritius.be" + renderKey("imageIntranetLink")
        }
    }

    x = requests.post(API_URL + "resources", json = element_final_dict)




