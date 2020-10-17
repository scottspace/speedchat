import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { signup, signInWithGoogle } from "../helpers/auth";

export default class SignUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
          error: null,
          email: '',
          password: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.googleSignIn = this.googleSignIn.bind(this);
      }

      handleChange(event) {
        this.setState({
          [event.target.name]: event.target.value
        });
      }

      async handleSubmit(event) {
        event.preventDefault();
        this.setState({ error: '' });
        try {
          await signup(this.state.email, this.state.password);
        } catch (error) {
          this.setState({ error: error.message });
        }
      }

      async googleSignIn() {
        try {
          await signInWithGoogle();
        } catch (error) {
          this.setState({ error: error.message });
        }
      }

      render() {
        return (
          <div className="container">
            <form className="mt-5 py-5 px-5" onSubmit={this.handleSubmit}>
              <h1>
                Sign Up to
              <Link className="title ml-2" to="/">SpeedChat</Link>
              </h1>
              <button className="btn btn-danger mr-2" type="button" onClick={this.googleSignIn}>
                Sign in with Google
              </button>
            </form>
          </div>
        )
      }
}