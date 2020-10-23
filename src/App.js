
import './App.css';

import React, { Component } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import Home from './pages/Home';
import Chat from './pages/Chat';
import Signup from './pages/Signup';
import Login from './pages/Login';
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
        : <Redirect to={{ pathname: '/peer', state: { from: props.location } }} />}
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
        : <Redirect to='/login' />}
    />
  )
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      loading: true,
    };
  };

  async startAI() {
    console.log("loading AI...");
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    console.log("AI models loaded");
  };

  componentDidMount() {
    this.startAI();
    auth().onAuthStateChanged((user) => {
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
    return this.state.loading === true ? (
      <div className="spinner-border text-success" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    ) : (
      <Router>
        <Switch>
          <Route exact path="/" auth={this.state.authenticated} component={Home}></Route>
          <PrivateRoute path="/peer" authenticated={this.state.authenticated} component={VideoPeer}></PrivateRoute>
          <PrivateRoute path="/chat" authenticated={this.state.authenticated} component={Chat}></PrivateRoute>
          <PublicRoute path="/signup" authenticated={this.state.authenticated} component={Signup}></PublicRoute>
          <PublicRoute path="/login" authenticated={this.state.authenticated} component={Home}></PublicRoute>
        </Switch>
      </Router>
    );
  }
}

export default App;
