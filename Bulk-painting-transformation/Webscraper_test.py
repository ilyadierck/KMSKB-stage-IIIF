from bs4 import BeautifulSoup
import requests

base_url = "http://193.190.214.119/"
painting_url = "http://193.190.214.119/fabritiusweb/FullBBBody.csp?SearchMethod=Find_1&Profile=Default&OpacLanguage=dut&EncodedRequest=k*F7x*E4*A2*F4At*08*CEz*F2*9A*C3*EA*F1&PageType=FullBB&RecordNumber="

page = requests.get(painting_url)
soup = BeautifulSoup(page.content, "html.parser")

# Get image url
table = soup.find("table", summary="FullBB.Description")

# Get table element
painting_metadata = table.find_all("tr")

# Collect metadata
for painting_data in painting_metadata:
    for td in painting_data.find_all("td"):
        for content in td.contents:
            res = content.string
            print(res)

# Get painting image source
img_src = table.find("img")["src"]

name_painting = img_src.split("/")[-1]

# Save image
r = requests.get(base_url + img_src, allow_redirects=True)
open(name_painting, 'wb').write(r.content)