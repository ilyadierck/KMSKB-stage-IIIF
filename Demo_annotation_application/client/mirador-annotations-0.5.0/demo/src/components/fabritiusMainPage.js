import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Box, TextField } from '@material-ui/core';
import Masonry from '@mui/lab/Masonry';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const Label = styled(Paper)(({ theme }) => ({
  backgroundColor: "#707070",
  padding: "0.5rem",
  textAlign: 'center',
  color: "black",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
}));

function Paintings(props){
  return (
    <Masonry columns={4} spacing={2} style={{padding: "2rem 0"}}>
        <div>
          <Label>Title</Label>
          <img
          src={`http://127.0.0.1:8887/database-dump/MikeA/MikeA/Anoniem-3784dig-L.jpg?w=162&auto=format`}
          srcSet={`http://127.0.0.1:8887/database-dump/MikeA/MikeA/Anoniem-3784dig-L.jpg?w=162&auto=format&dpr=2 2x`}
          loading="lazy"
          style={{
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            display: 'block',
            width: '100%',
          }}></img>
        </div>
    </Masonry>
  )
}

function paintingDatabasePage(props){
  return (<Box sx={{
    display: 'flex',
    flexDirection: 'column',
    width: "89%",
    height: '100%',
    marginLeft: "auto",
    marginRight: 0,
    }}>
      <Box style={{
        padding: "1rem",
        paddingLeft: 0
      }}>
        <Typography variant="h1">
          Fabritius paintings
        </Typography>
      </Box>
      <Box style={{
        
      }}>
        <Typography variant="h2" style={{padding: "1rem 0"}}>
          Browse the collections
        </Typography>
        <TextField style={{
          width: "95%",
          backgroundColor: "#F5F5F5",
          borderRadius: "0.25rem"
        }} label="Painting or artist name" variant="outlined"/>
      </Box>
     <Box>
      <ManifestListItem></ManifestListItem>
     </Box>
  </Box>)
}

export default  function(props){
  var t = props.t;
  return (React.createElement('div', {
    style: {
      height: '100%',
      width: "95%",
      marginLeft: "auto",
      marginRight: 0,
      }
    },React.createElement(paintingDatabasePage))
  )
}

/*
export default function (props) {
    var t = props.t;
    return React.createElement(Grid, {
        container: true,
        style: {
          height: '100%',
          width: "95%",
          marginLeft: "auto",
          marginRight: 0,
          justifyContent: "center",
          alignContent: "center",
          rowGap: "30%"
        }
      }, React.createElement(Grid, {
        xs: 10,
        item: true,
        
      }, React.createElement(TextField, {
        label: "Painting or artist name",
        variant: "outlined",
        style: {
          width: "95%",
          backgroundColor: "#F5F5F5",
          borderRadius: "0.25rem"
        }
      })),
      React.createElement(Grid, {
        xs: 10,
        item: true,
      },
      React.createElement(Typography, {
        variant: "h2"
      },t("Results"))));
}
*/
