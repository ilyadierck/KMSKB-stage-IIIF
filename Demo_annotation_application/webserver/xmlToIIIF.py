from pyclbr import Function
from unittest import skip
import xml.etree.ElementTree as ET
import yaml
import requests
import shutil
import os
import time

XML_PATH = "database-dump/database-dump.xml"
BIIIF_PATH = "biiif-npm-version/paintings/"
WEBSERVER_URL = "http://127.0.0.1:8887/biiif-npm-version/paintings/"
FABRITIUS_BASE_URL = "http://193.190.214.119"
 
tree = ET.parse(XML_PATH)
root = tree.getroot()
#test_element = list(root)[0]

def setupIIIFStructure(image_name, element_dict):
    biiifPath = BIIIF_PATH + element_dict["workID"].replace("/", "") + "-" + image_name.split("-")[0].replace("/", "")
    biiifPath = biiifPath.replace(" ", "")

    if (os.path.exists(biiifPath)):
        return ""
    
    r = requests.get(FABRITIUS_BASE_URL + element_dict['imageIntranetLink'], stream = True, timeout=5)
    
    if r.status_code == 200:
        r.raw.decode_content = True
        
        if not os.path.exists(biiifPath):
            os.mkdir(biiifPath)

        with open(biiifPath + "/" + image_name,'wb') as f:
            shutil.copyfileobj(r.raw, f)
        
        ymlPath = biiifPath+ "/"+ 'info.yml'
        with open(ymlPath, 'w') as file:
            yaml.dump(element_final_dict, file)
            
        print('Xml record succesfully made IIIF conform.')
    else:
        print('Unable to download image')

def renderDescription():
    if "ObjectWorkType" in element_dict:
        description = element_dict["termClassification"] + "\n" + element_dict["ObjectWorkType"]
    else:
        description = element_dict["termClassification"]
        return description

def renderAuthor():
    author = "unknown"
    if "creatorDescription" in element_dict:
        author = element_dict["creatorDescription"]
    elif "birthDateCreator" in element_dict and "deathDateCreator" in element_dict:
        author += " (" +  element_dict["birthDateCreator"] + " - " + element_dict["deathDateCreator"] + ")"
    return author
    
def renderKey(key):
    if key in element_dict:
        return element_dict[key]
    else:
        return ""

for element in list(root):
    element_dict = {}
    for child_element in element.iter():
        element_dict[child_element.tag] = str(child_element.text)

    if 'imageIntranetLink' not in element_dict or 'workID' not in element_dict:
        continue

    image_name = element_dict['imageIntranetLink'].split("/")[-1]

    element_final_dict = {
        "label": element_dict["workID"] + "-" + image_name.split("-")[0],
        "attribution": renderKey("copyrightStatement"),
        "metadata" : {
            "Owned By": renderKey("legalStatus"),
            "Description": renderDescription(),
            "Author": renderAuthor(),
            "Creation year": renderKey("latestDate")
        }
    }




