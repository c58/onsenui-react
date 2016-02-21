import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import Showcase from "./components/showcase";
import './styles/onsenui.css';
import './styles/onsen-css-components.css';

ReactDOM.render(Showcase, window.document.getElementById("react-root"));
