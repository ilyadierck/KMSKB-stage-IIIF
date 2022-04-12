import mirador from 'mirador/dist/es/src/index';
import { func } from 'prop-types';
import annotationPlugins from '../../src';
import CustomFlaskAdapter from '../../src/CustomFlaskAdapter';
import testComponent from './test_list.js';

let miradorInstance;

function initialiseMirador(){
  const endpointUrl = "http://127.0.0.1:5000/annotations";
  const config = {
    annotation: {
      adapter: (canvasId) => new CustomFlaskAdapter(canvasId, endpointUrl)
    },
    id: 'demo',
    window: {
      defaultSideBarPanel: 'annotations',
      sideBarOpenByDefault: true,
    },
    //windows: [{
      //loadedManifest: 'http://127.0.0.1:8887/1-test-painting-2/index.json',
    //}],
  };
  const plugin = {
    target: 'WorkspaceAdd',
    mode: 'wrap',
    component: testComponent,
    //connectOptions: additionalOptionsToPassToReduxConnect,,
    //mapDispatchToProps: mapDispatchToProps,
    //reducers: {
      //pluginState: pluginStateReducer,
    //},
    //saga: saga,
    value: 'Button thing'
  };

  miradorInstance = mirador.viewer(config, [...annotationPlugins, ...plugin]);
}

initialiseMirador()

