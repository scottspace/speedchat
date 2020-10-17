import React, { Component } from "react";
import User from './User';
import { usersRef } from "../services/firebase";

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
    this.setState({'loading': true});
    var users = [];
    snapshot.forEach(function(doc) {
        users.push({'id': doc.id, 'data': doc.data()});
    });
    this.setState({'loading': false, 'users': users});
    console.log("Got users");
    console.log(users);
  }

  onSelect(peerId) {
      var selector = this.props.onSelect;
      console.log("UserList heard peer "+peerId);
      if (selector !== undefined) selector(peerId);
  };

  async componentDidMount() {
   try {
     var updater = this.updateUsers;
     usersRef.get().then(function(snapshot) {
        updater(snapshot);
     });
     usersRef.onSnapshot(function(snapshot) {
        updater(snapshot);
     });
   } catch (error) {
     this.setState({ readError: error.message, loading: false });
   }
  };

  render() {
    var selector = this.onSelect;
    return (
      <div className="Userlist-container">
        {this.state.users.map((user) => (
          <User key={user.id} data={user.data} onSelect={selector}/>
        ))}
      </div>
    )
  };

}

export default UserList;