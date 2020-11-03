import React, { Component } from "react";
import User from './User';
import { db, usersRef } from "../services/firebase";

const MAX_USERS = 6;

class UserList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: false
    };
    this.myRef = React.createRef();
    this.updateUsers = this.updateUsers.bind(this);
    this.onSelect = this.onSelect.bind(this);
  };

  updateUsers(snapshot) {
    // TODO what if users are long... hundreds, thousands?
    this.setState({ 'loading': true });
    var users = [];
    snapshot.forEach(function (doc) {
      users.push({ 'id': doc.id, 'data': doc.data() });
    });
    this.setState({ 'loading': false, 'users': users });
  }

  onSelect(peerId) {
    var selector = this.props.onSelect;
    console.log("UserList heard peer " + peerId);
    if (selector !== undefined) selector(peerId);
  };

  async componentDidMount() {
    try {
      var updater = this.updateUsers;
      usersRef.get().then(function (snapshot) {
        updater(snapshot);
      });
      usersRef.onSnapshot(function (snapshot) {
        updater(snapshot);
      });
    } catch (error) {
      this.setState({ readError: error.message, loading: false });
    }
  };

  render() {
    var selector = this.onSelect;
    var allUsers = this.state.users;
    var shownUsers = allUsers;
    var moreUsers = false;
    if (shownUsers.length > MAX_USERS) {
      shownUsers = allUsers.slice(0, MAX_USERS);
      moreUsers = (<div className="UserClass">
        <div className="User-avatar anonymous">
          {"+" + (allUsers.length - MAX_USERS)}
        </div></div>);
    }
    return (
        <div className="Userlist-container">
          {shownUsers.map((user) => {
            var uid = user.id;
            return (
            <User key={user.id} data={user.data} onSelect={selector} />
            )})}
          {moreUsers}
      </div>
      )
    };

}

export default UserList;