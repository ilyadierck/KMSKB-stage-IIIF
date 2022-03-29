
import mirador from 'mirador/dist/es/src/index';
import annotationPlugins from '../../src';
import CustomFlaskAdapter from '../../src/CustomFlaskAdapter';
import LocalStorageAdapter from '../../src/LocalStorageAdapter';
import AnnototAdapter from '../../src/AnnototAdapter';
import SimpleAnnotationServerV2Adapter from "../../src/SimpleAnnotationServerV2Adapter";

const endpointUrl = "http://127.0.0.1:5000/annotations";
const config = {
  annotation: {
    adapter: (canvasId) => new CustomFlaskAdapter(canvasId, endpointUrl)
    //adapter: (canvasId) => new SimpleAnnotationServerV2Adapter(canvasId, endpointUrl)
    //adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
    //adapter: (canvasId) => new AnnototAdapter(canvasId, endpointUrl),
    //exportLocalStorageAnnotations: false, // display annotation JSON export button
  },
  id: 'demo',
  window: {
    defaultSideBarPanel: 'annotations',
    sideBarOpenByDefault: true,
  },
  windows: [{
    loadedManifest: 'http://127.0.0.1:8887/1-test-painting-2/index.json',
  }],
};

mirador.viewer(config, [...annotationPlugins]);
