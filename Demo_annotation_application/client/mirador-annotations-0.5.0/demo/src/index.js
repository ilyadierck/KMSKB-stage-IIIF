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
import SendIcon from '@mui/icons-material/Send';
import { times } from 'lodash';


const APIURL = "http://127.0.0.1:5000"
let miradorInstance;

async function fetchAuthors(){
  return await fetch(APIURL + "/authors")
    .then(promise => promise.json())
    .then(function(authors){
      return authors;
    })
}

async function fetchResources(){
  return await fetch(APIURL + "/resources" + "?id=&authorName=&authorBirthdate=&authorDeathdate=&creationYear=&description=")
    .then(function(promise){
      if (promise.status != 200){
        return []
      }
      return promise.json().then(function(resources){
        return resources;
      })
    })
    
}

class KmskbComponent extends Component {
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleLoadMoreResources = this.handleLoadMoreResources.bind(this);
    this.handleResourceLookup = this.handleResourceLookup.bind(this);
    this.state = {"loading": false, "lastindex":0, "resources": null}
  }

  handleResourceLookup(event){
    if (!this.state.loading){
      this.setState({"loading": true});
      fetch(APIURL + "/resources?id=&authorName=&authorBirthdate=&authorDeathdate=&creationYear=&description=&bulkmetadata=" + document.querySelector("#textInput").value).then(resp => resp.json())
      .then(filteredResources => this.setState({"resources" : filteredResources})).then(() => this.setState({"loading": false}));
    } 
  }

  handleLoadMoreResources(){
    this.setState({"loading": true, "lastindex": this.state.lastindex+20})
    this.setState({"loading": false});
  }
  
  handleClick(e){
    let li = e.target.closest("li");
    let resourceId = li.dataset.resourceid;
    let authorId = li.dataset.authorid;
    let resource;
    let manifest = li.dataset.manifestid;
    let clearWorkspace = mirador.actions.setWorkspaceAddVisibility(false);

    for (let i = 0; i < this.props.resources.length; i++){
      if (this.props.resources[i][0] === resourceId){
        resource = this.props.resources[i];
      }
    }

    fetch(APIURL + "/iiif", {method: "POST", body: JSON.stringify({
        author: this.props.authors[authorId],
        resource: resource
    }),
    headers: {
      'Content-Type': 'application/json',
    }}).then(resp => resp.text()).then(function(){
      miradorInstance.store.dispatch(clearWorkspace);
      let action = mirador.actions.addWindow({
        companionWindows: "",
        manifestId: manifest,
        isFetching: true
      });
      
      miradorInstance.store.dispatch(action);
    
      let windowId = Object.keys(miradorInstance.store.getState().windows);
      windowId = undefined;
      var action2 = mirador.actions.setCanvas(windowId, manifest)
      
      miradorInstance.store.dispatch(action2);
    });
  }

  
  render(){
    let resources = this.state.resources;
    const authors = this.props.authors;
    if (resources === null){
      resources = this.props.resources;
      this.setState({"resources" : resources})
    }

    return (React.createElement('div', {
      style: {
        height: '100%',
        width: "95%",
        marginLeft: "auto",
        marginRight: 0,
        overflow: "auto"
        }
      },
      React.createElement("div",{

      },
      React.createElement(TextField, {
        style: {
          marginTop:"2rem",
          width: "98%",
          backgroundColor: "#F5F5F5",
          borderRadius: "0.25rem"
        },
        label: "Search query",
        placeholder: "Artist, inventaris number, annotation, ..",
        variant: "outlined",
        id: "textInput"
      }), React.createElement("div", {
        style:{
          marginTop: "0.2rem"
        }

      },React.createElement(Button, {
        variant: "contained",
        onClick: this.handleResourceLookup
      }, 'Search'))
      ),
      
      React.createElement('ul', {
        id: "resources",
        style: {
          backgroundColor: "#fff",
          padding:0, 
          width: '98%'
        }
      },
      resources.slice(0,this.state.lastindex+20).map((resource, index) => 
        React.createElement(ManifestListItem, [this, resource, authors, index])
      )),
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
      let resource = options[1];
      let authors = options[2];
      let resourceId = resource[0];
      let author;
      let props = options[0].props;
      let buttonRef = "";
      let ready = true;
      let isCollection = false;
      let provider= props.provider;
      var t = props.t;
      let size = 60;
      let manifestLogo = "";
      let authorId;
      let title = resource[5];
      let type = resource[6];
      if (title === " " || title === "." || title === "unknown"){
        title = resource[2];
        type = ""
      }

      title = title.charAt(0).toUpperCase() + title.slice(1);

      for (let i = 0; i < authors.length; i++){
        if (authors[i][0] === resource[1]){
          author = authors[i];
          authorId = i;
        }
      }
      
      let manifestId = "http://127.0.0.1:8887/biiif-npm-version/paintings/" + (resource[0].replaceAll("/", "")).replaceAll(" ", "") + "/index.json";
      let imageUrlOld = resource[4].split("/").slice(0,5)
      let imageUrlNew = imageUrlOld.join().concat(["/internet", resource[4].split("/").at(-1)]).replaceAll(",", "/")
      let thumbnail = imageUrlNew.replace(/H./, "L.");

      return /*#__PURE__*/React.createElement(ListItem, {
          divider: true,
          //className: [classes.root, active ? classes.active : ''].join(' '),
          "data-manifestid": manifestId,
          "data-resourceid": resourceId,
          "data-authorid": authorId
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
          className: ns('manifest-list-item-thumb'),
          src: thumbnail,
          alt: "title",
          height: "80",
        })), /*#__PURE__*/React.createElement(Grid, {
          item: true,
          xs: 8,
          sm: 9,
          component: "span",
          style: {
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around"
          }
        }, isCollection && /*#__PURE__*/React.createElement(Typography, {
          component: "div",
          variant: "overline"
        }, t(isMultipart ? 'multipartCollection' : 'collection')),
        React.createElement(Typography, {
          component: "span",
          variant: "h6",
          style: {
            fontWeight: "bold"
          }
        }, t(title)),
        /*#__PURE__*/React.createElement(Typography, {
          component: "span",
          variant: "h6",
        }, author[1] + " (" + author[2] + " - " + author[3] +  ")"))))), /*#__PURE__*/React.createElement(Grid, {
          item: true,
          xs: 8,
          sm: 4,
          style: {
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around"
          }
        }, /*#__PURE__*/React.createElement(Typography, {
          className: ns('manifest-list-item-provider')
        }, provider), /*#__PURE__*/React.createElement(Typography, {
            style: {
              fontWeight: "bold"
            }
        }, t("Created")),
        React.createElement(Typography, {
            style: {
              marginTop: "1rem"
            }
        }, resource[3])
        ), /*#__PURE__*/React.createElement(Grid, {
          item: true,
          xs: 4,
          sm: 2
        }, manifestLogo && /*#__PURE__*/React.createElement(Img, {
          src: [thumbnail],
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
      adapter: (id) => new CustomFlaskAdapter(id, endpointUrl)
    },
    id: 'demo',
    window: {
      defaultSideBarPanel: 'annotations',
      sideBarOpenByDefault: true,
    },
    workspace: {
      isWorkspaceAddVisible: true
    }
  };
  fetchAuthors()
    .then(function(authors){
      fetchResources()
        .then(function(resources){
          const workshopAddPlugin = {
            target: 'WorkspaceAdd',
            mode: 'wrap',
            component: KmskbComponent,
            mapStateToProps: () => {
              return {
                resources: resources,
                authors: authors,
              }
            }
          };
          miradorInstance = mirador.viewer(config, [...annotationPlugins, ...workshopAddPlugin]);
      });
  });
}

initialiseMirador()