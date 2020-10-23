
import './App.css';

import React, { Component } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import Home from './pages/Home';
import VideoPeer from './pages/VideoPeer';
import { auth } from './services/firebase';
import './styles.css';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Higher order component
function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authenticated === true
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
    />
  )
}

// Higher order component
function PublicRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authenticated === false
        ? <Component {...props} />
        : <Redirect to='/' />}
    />
  )
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      ai: false,
      loading: true,
    };
  };

  async startAI() {
    if (this.state.ai === false) {
      console.log("loading AI...");
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      await faceapi.loadFaceRecognitionModel(MODEL_URL);
      this.setState({ ai: true });
      console.log("AI models loaded");
    }
  };

  componentDidMount() {
    this.startAI();
    auth().onAuthStateChanged((user) => {
      console.log("Auth changed", user, this.state);
      if (user) {
        this.setState({
          authenticated: true,
          loading: false,
        });
      } else {
          this.setState({
            authenticated: false,
            loading: false,
          });
      }
    })
  }

  render() {
    console.log("App render", this.state);
    return this.state.loading === true ? (
      <div className="spinner-border text-success" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    ) : (
        <Router>
          <Switch>
            <Route exact path="/" >
              <Home auth={this.state.authenticated} />
              </Route>
            <PrivateRoute path="/chat" authenticated={this.state.authenticated} component={VideoPeer}></PrivateRoute>
          </Switch>
        </Router>
      );
  }
}

export default App;
