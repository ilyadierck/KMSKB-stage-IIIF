import mirador from 'mirador/dist/es/src/index';
import annotationPlugins from '../../src';
import CustomFlaskAdapter from '../../src/CustomFlaskAdapter';
import React, { Component, useContext } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import Skeleton from '@material-ui/lab/Skeleton';
import ns from 'mirador/dist/es/src/config/css-ns';
import ButtonBase from '@material-ui/core/ButtonBase';

let miradorInstance;

function handleClick(props){
  let clearWorkspace = mirador.actions.setWorkspaceAddVisibility(false);
  miradorInstance.store.dispatch(clearWorkspace);

  let action = mirador.actions.addWindow({
    companionWindows: "",
    manifestId: "http://127.0.0.1:8887/biiif-npm-version/paintings/10000123-Meunier/index.json"
  });

  miradorInstance.store.dispatch(action);

  let windowId = Object.keys(miradorInstance.store.getState().windows);
  windowId = undefined;
  var action2 = mirador.actions.setCanvas(windowId, 'http://127.0.0.1:8887/biiif-npm-version/paintings/10000123-Meunier/index.json')
  
  miradorInstance.store.dispatch(action2);
}

function ManifestListItem(props){
    let buttonRef = "";
    let manifestId = "http://127.0.0.1:8887/biiif-npm-version/paintings/10000123-Meunier/index.json";
    let ready = true;
    let thumbnail = "";
    let isCollection = false;
    let title = "test";
    let provider= props.provider;
    var t = props.t;
    let size = 60;
    let manifestLogo = "";


    return /*#__PURE__*/React.createElement(ListItem, {
        divider: true,
        //className: [classes.root, active ? classes.active : ''].join(' '),
        "data-manifestid": manifestId
      }, ready ? /*#__PURE__*/React.createElement(Grid, {
        container: true,
        className: ns('manifest-list-item'),
        spacing: 2
      }, /*#__PURE__*/React.createElement(Grid, {
        item: true,
        xs: 12,
        sm: 6,
        //className: classes.buttonGrid
      }, /*#__PURE__*/React.createElement(ButtonBase, {
        //ref: buttonRef,
        className: ns('manifest-list-item-title'),
        style: {
          width: '100%'
        },
        onClick: handleClick
      }, /*#__PURE__*/React.createElement(Grid, {
        container: true,
        spacing: 2,
        //className: classes.label,
        component: "span"
      }, /*#__PURE__*/React.createElement(Grid, {
        item: true,
        xs: 4,
        sm: 3,
        component: "span"
      }, thumbnail ? /*#__PURE__*/React.createElement(Img, {
        //className: [classes.thumbnail, ns('manifest-list-item-thumb')].join(' '),
        src: [thumbnail],
        alt: "",
        height: "80",
        unloader: /*#__PURE__*/React.createElement(Skeleton, {
          variant: "rect",
          animation: false,
          //className: classes.placeholder,
          height: 80,
          width: 120
        })
      }) : /*#__PURE__*/React.createElement(Skeleton, {
        //className: classes.placeholder,
        variant: "rect",
        height: 80,
        width: 120
      })), /*#__PURE__*/React.createElement(Grid, {
        item: true,
        xs: 8,
        sm: 9,
        component: "span"
      }, isCollection && /*#__PURE__*/React.createElement(Typography, {
        component: "div",
        variant: "overline"
      }, t(isMultipart ? 'multipartCollection' : 'collection')), /*#__PURE__*/React.createElement(Typography, {
        component: "span",
        variant: "h6"
      }, title || manifestId))))), /*#__PURE__*/React.createElement(Grid, {
        item: true,
        xs: 8,
        sm: 4
      }, /*#__PURE__*/React.createElement(Typography, {
        className: ns('manifest-list-item-provider')
      }, provider), /*#__PURE__*/React.createElement(Typography, null, t('numItems', {
        count: size,
        number: size
      }))), /*#__PURE__*/React.createElement(Grid, {
        item: true,
        xs: 4,
        sm: 2
      }, manifestLogo && /*#__PURE__*/React.createElement(Img, {
        src: [manifestLogo],
        alt: "",
        role: "presentation",
        //className: classes.logo,
        unloader: /*#__PURE__*/React.createElement(Skeleton, {
          variant: "rect",
          animation: false,
          //className: classes.placeholder,
          height: 60,
          width: 60
        })
      }))) : placeholder);
}

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
    component: function(props){
      var t = props.t;
      return (React.createElement('div', {
        style: {
          height: '100%',
          width: "95%",
          marginLeft: "auto",
          marginRight: 0,
          }
        },
        React.createElement('ul', {style: {backgroundColor: "#fff",padding:0, width: '98%'}},
        React.createElement(ManifestListItem, props),
        React.createElement(ManifestListItem, props)
        )
      ))}
  };

  miradorInstance = mirador.viewer(config, [...annotationPlugins, ...plugin]);
}

initialiseMirador()

