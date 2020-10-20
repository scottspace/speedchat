import React, { Component } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from "../helpers/auth";
import {
  Redirect
} from "react-router-dom";

export default class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authenticated: this.props.authenticated
    };
    console.log("Home auth: ", this.state)
  };
  
  render() {
    console.log(this.props);
    if (this.props.authenticated === true) {
      console.log("redirecting");
      return (<Redirect to='/peer' />);
    }
    return (
      <div className="home">
        <Header></Header>
        <section>
          <div className="jumbotron jumbotron-fluid py-5">
            <div className="container text-center py-5">
              <h1 className="display-4">SpeedChat</h1>
              <p className="lead">A great place to meet new friends</p>
              <div className="mt-4">
                <button className="btn btn-primary px-5 mr-3" type="button"
                onClick={signInWithGoogle}>Sign in with Google</button>
              </div>
            </div>
          </div>
        </section>
        <Footer></Footer>
      </div>
    )
  }
}