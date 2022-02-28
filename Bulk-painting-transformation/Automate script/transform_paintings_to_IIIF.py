
#Starting from IIIF link, steps before are temp. done by hand.
#IIIF link: http://localhost:8182/iiif/2/bouts-test-painting.jpg/info.json
from iiif_prezi.factory import ManifestFactory

iiif_link = "http://localhost:8182/iiif/2/bouts-test-painting.jpg/info.json"
to_create_manifest_paintings = "Bouts-test-painting.jpg"

factory = ManifestFactory()
factory.set_base_prezi_uri("http://localhost:8182/iiif/2/")
factory.set_base_prezi_dir("../../IIIF testing/cantaloupe-5.0.5/cantaloupe-5.0.5/testimages")
factory.set_base_image_uri("http://localhost:8182/iiif/2/")
factory.set_iiif_image_info(2.0, 2) # Version, ComplianceLevel
factory.set_debug("warn") 

manifest = factory.manifest(ident="manifest 2", label="Example Manifest 2")

seq = manifest.sequence()
cvs = seq.canvas(ident=to_create_manifest_paintings, label=to_create_manifest_paintings)
cvs.set_image_annotation(to_create_manifest_paintings, iiif=True)

manifest.toFile(compact=False)