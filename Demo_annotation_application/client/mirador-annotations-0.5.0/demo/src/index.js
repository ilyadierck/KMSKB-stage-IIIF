import mirador from 'mirador/dist/es/src/index';
import annotationPlugins from '../../src';
import CustomFlaskAdapter from '../../src/CustomFlaskAdapter';
import React, { Component, useContext, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Typography, ListItem, TextField } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import ns from 'mirador/dist/es/src/config/css-ns';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { Img } from 'react-image';
import { times } from 'lodash';

const xmlUrl = "http://127.0.0.1:8887/database-dump/database-dump.xml"
let miradorInstance;

function getKey(key, record, backupValue){
  let foundElements = record.getElementsByTagName(key)[0]
  if (foundElements != undefined){
    return foundElements.childNodes[0].nodeValue
  } else {
    return backupValue
  } 
}

let lastIndex = 0;

async function fetchXml(){
  return fetch(xmlUrl)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(function(data){
          let records = data.getElementsByTagName("record");
          let gatheredInfo = [];
          let limit = lastIndex + 20
          for (let i = lastIndex+1; i < records.length; i++){
            if (i < limit){
              let record = records[i];
              let recordInfo = {
                title: getKey("imageOpacLink", record, "").split("/").at(-1).replace("-", " ").replace("-L.jpg", ""),
                thumbnail: "http://www.opac-fabritius.be" + getKey("imageOpacLink", record, ""),
                created: getKey("latestDate", record, "unknown"),
                description: getKey("termClassification", record, "") + " \n " + getKey("ObjectWorkType", record, ""),
                author: {
                  name: getKey("creatorDescription", record, "unknown"),
                  birthDate: getKey("birthDateCreator", record, "unknown"),
                  deathDate: getKey("deathDateCreator", record, "unknown")
                },
                manifestId: ("http://127.0.0.1:8887/biiif-npm-version/paintings/" + getKey("workID",record, "").replace("/", "").replace(" ", "") + "-" + getKey("imageOpacLink", record, "").split("/").at(-1).split("-").at(0).replace("/", "") + "/index.json").replace(" ", "")
              }
              gatheredInfo.push(recordInfo)
              lastIndex = i;
            } 
          }  
          return gatheredInfo;
        });
}

class KmskbComponent extends Component {

  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleLoadMoreResources = this.handleLoadMoreResources.bind(this);
    this.state = {"infoRecords" : null} ;
  }

  handleResourceLookup(){

  }

  handleLoadMoreResources(){
    let temp = this;
    temp.setState({"loading": true}),
    fetchXml().then(function(infoRecords){
      temp.setState({"infoRecords" : temp.state.infoRecords.concat(infoRecords)});
      temp.setState({"loading": false})
    });
  }
  
  handleClick(e){
    let manifest = e.target.closest("li").dataset.manifestid;
    let clearWorkspace = mirador.actions.setWorkspaceAddVisibility(false);
    miradorInstance.store.dispatch(clearWorkspace);
  
    let action = mirador.actions.addWindow({
      companionWindows: "",
      manifestId: manifest
    });
  
    miradorInstance.store.dispatch(action);
  
    let windowId = Object.keys(miradorInstance.store.getState().windows);
    windowId = undefined;
    var action2 = mirador.actions.setCanvas(windowId, manifest)
    
    miradorInstance.store.dispatch(action2);
  }
  
  render(){
    let infoRecords = this.state.infoRecords;
    if (infoRecords === null){
      infoRecords = this.props.infoRecords;
      this.setState({"infoRecords" : infoRecords})
    }
    return (React.createElement('div', {
      style: {
        height: '100%',
        width: "95%",
        marginLeft: "auto",
        marginRight: 0,
        overflow: "auto"
        }
      },React.createElement(TextField, {
        style: {
          marginTop:"2rem",
          width: "98%",
          backgroundColor: "#F5F5F5",
          borderRadius: "0.25rem"
        },
        label: "Painting or artist name",
        variant: "outlined",
        onchange: this.handleResourceLookup
      }),
      React.createElement('ul', {
        id: "resources",
        style: {
          backgroundColor: "#fff",
          padding:0, 
          width: '98%'
        }
      },
      infoRecords.map((recordInfo) =>
          React.createElement(ManifestListItem, [this, recordInfo]),
        )
      ),
      React.createElement("div", {
        style: {
          textAlign:"center"
        }
      },React.createElement(LoadingButton, {
        loading: this.state.loading,
        onClick: this.handleLoadMoreResources,
        variant: "contained",
        style:{
          margin: "1rem",
          textAlign: "center"
        }
      }, "Load more"))
    ))
  }
}

function ManifestListItem(options){
      let recordInfo = options[1];
      let props = options[0].props;
      let buttonRef = "";
      let manifestId = recordInfo.manifestId;
      let ready = true;
      let thumbnail = recordInfo.thumbnail;
      let isCollection = false;
      let title = recordInfo.title;
      let provider= props.provider;
      var t = props.t;
      let size = 60;
      let manifestLogo = "";
      let description = recordInfo.description;
      let author = recordInfo.author;
      let createdDate = recordInfo.created;
  
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
          onClick: options[0].handleClick
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
        }, /*#__PURE__*/React.createElement(Img, {
          //className: [classes.thumbnail, ns('manifest-list-item-thumb')].join(' '),
          src: thumbnail,
          alt: "test",
          height: "80",
        })), /*#__PURE__*/React.createElement(Grid, {
          item: true,
          xs: 8,
          sm: 9,
          component: "span",
          style: {
            textAlign: "left"
          }
        }, isCollection && /*#__PURE__*/React.createElement(Typography, {
          component: "div",
          variant: "overline"
        }, t(isMultipart ? 'multipartCollection' : 'collection')), /*#__PURE__*/React.createElement(Typography, {
          component: "span",
          variant: "h6"
        }, description), React.createElement(Typography, {
          style: {
            marginTop: "1rem"
          }
        }, title))))), /*#__PURE__*/React.createElement(Grid, {
          item: true,
          xs: 8,
          sm: 4
        }, /*#__PURE__*/React.createElement(Typography, {
          className: ns('manifest-list-item-provider')
        }, provider), /*#__PURE__*/React.createElement(Typography, {
  
        }, "Author: " + author.name + " (" + author.birthDate + " - " + author.deathDate +  ")"),
        React.createElement(Typography, {
            style: {
              marginTop: "1rem"
            }
        }, "Created in: " + createdDate)
        ), /*#__PURE__*/React.createElement(Grid, {
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
  };
  fetchXml().then(function(infoRecords){
    const plugin = {
      target: 'WorkspaceAdd',
      mode: 'wrap',
      component: KmskbComponent,
      mapStateToProps: () => {
        return {
          infoRecords: infoRecords,
        }
      }
    };
    miradorInstance = mirador.viewer(config, [...annotationPlugins, ...plugin]);
  });
}

initialiseMirador()