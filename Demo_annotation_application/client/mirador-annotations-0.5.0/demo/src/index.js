import mirador from 'mirador/dist/es/src/index';
import { func } from 'prop-types';
import annotationPlugins from '../../src';
import CustomFlaskAdapter from '../../src/CustomFlaskAdapter';
import testComponent from './components/test-component';

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
    //connectOptions: additionalOptionsToPassToReduxConnect,
    //mapStateToProps: mapStateToProps,
    //mapDispatchToProps: mapDispatchToProps,
    //reducers: {
      //pluginState: pluginStateReducer,
    //},
    //saga: saga,
    value: 'Button thing'
  };

  mirador.viewer(config, [...annotationPlugins, ...plugin]);
}

async function getXmlDatabase(){
  fetch('http://127.0.0.1:8887/database-dump/database-dump.xml')
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(function(data){
    console.log(data)
    console.log(data.getElementsByTagName("record")[0])
  });
}

getXmlDatabase()
initialiseMirador()

