import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';

export default function (props) {
    var t = props.t;
    return /*#__PURE__*/React.createElement(Grid, {
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
      }, /*#__PURE__*/React.createElement(Grid, {
        xs: 10,
        item: true,
        
      }, /*#__PURE__*/React.createElement(TextField, {
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