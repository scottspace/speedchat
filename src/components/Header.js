import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebase';
import UserList from '../components/UserList';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      userList: React.createRef()
    };
  };

  setUsers(users) {
    this.setState({ users });
  }

  render() {
    return (
      <header>
        <nav className="navbar navbar-expand-sm fixed-top navbar-light bg-light">
          <img className="octo-image" src="/logo192.png" />
          <Link className="navbar-brand" to="/">OctoChat</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
            {auth().currentUser
              ? <div className="navbar-nav">
                <div className="justify-content-end navbar-collapse collapse">
                   <UserList ref={this.state.userList} users={this.state.users} />
                </div>
                <button className="btn btn-primary mr-3" onClick={() => auth().signOut()}>Logout</button>
              </div>
              : <div className="navbar-nav">
                <Link className="nav-item nav-link mr-3" to="/">Sign In</Link>
              </div>}
          </div>
        </nav>
      </header>
    );
  };
};

export default Header;
