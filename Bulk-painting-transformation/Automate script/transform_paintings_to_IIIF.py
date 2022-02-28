
#Starting from IIIF link, steps before are temp. done by hand.
#IIIF link: http://localhost:8182/iiif/2/bouts-test-painting.jpg/info.json
from iiif_prezi.factory import ManifestFactory
import os
import shutil

#CONFIG
IIIF_IMAGE_SERVER_DIR = "../../IIIF testing/cantaloupe-5.0.5/cantaloupe-5.0.5/testimages/"
IIIF_IMAGE_SERVER = "http://localhost:8182/iiif/2/"
PAINTINGS_DIR = "Paintings"
MANIFEST_DIR = "Manifests"


factory = ManifestFactory()
factory.set_base_prezi_uri(IIIF_IMAGE_SERVER)
factory.set_base_prezi_dir(MANIFEST_DIR)
factory.set_base_image_uri(IIIF_IMAGE_SERVER)
factory.set_iiif_image_info(2.0, 2) # Version, ComplianceLevel
factory.set_debug("warn") 

for dir in os.listdir(PAINTINGS_DIR):
    manifest = factory.manifest(ident=dir, label=dir)
    seq = manifest.sequence()
    path = PAINTINGS_DIR + "/" + dir
    for image in os.listdir(path):
        image_path = path + "/" + image
        if not os.path.exists(image_path):
            shutil.copy(path + "/" + image, IIIF_IMAGE_SERVER_DIR)
        cvs = seq.canvas(ident=image, label=image.split("-")[0])
        cvs.set_image_annotation(image, iiif=True)

    manifest.toFile(compact=False)