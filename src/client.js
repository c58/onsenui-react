import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import Showcase from "./components/showcase";
import ons from './components/onsen/ons';
import './components/onsen/setup';
import './styles/onsenui.css';
import './styles/onsen-css-components.css';


ons.ready(() => {
  ReactDOM.render(Showcase, window.document.getElementById("react-root"));
});
