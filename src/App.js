
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
      loading: true,
    };
  };


  componentDidMount() {
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
