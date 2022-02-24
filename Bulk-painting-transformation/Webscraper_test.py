from bs4 import BeautifulSoup
import requests

base_url = "http://193.190.214.119/"
painting_url = "http://193.190.214.119/fabritiusweb/FullBBBody.csp?SearchMethod=Find_1&Profile=Default&OpacLanguage=dut&EncodedRequest=*C3*AA*E4*E7*CEP*CF*C5*9B*9E*F87Cu*AE*CA&PageType=FullBB&RecordNumber="
page = requests.get(painting_url)
soup = BeautifulSoup(page.content, "html.parser")


# Get image url
table = soup.find("table", summary="FullBB.Description")

# Get table element
painting_metadata = table.find_all("tr")

# Collect metadata
for painting_data in painting_metadata:
    for td in painting_data.find_all("td"):
        if len(td) > 1:
            for child in td:
                res = child.string
                if res != None and len(res) > 2:
                    print(child.string.replace("\n", ""))
        else:
            print(td.string)

# Get painting image source
images = table.find_all("img")

for image in images:
    img_src = image['src']
    name_painting = img_src.split("/")[-1]

    # Save image
    r = requests.get(base_url + img_src, allow_redirects=True)
    open(name_painting, 'wb').write(r.content)