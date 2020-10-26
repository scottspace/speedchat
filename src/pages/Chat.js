import React, { Component } from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { usersRef } from "../services/firebase";
import UserList from "../components/UserList";
import Peer from "peerjs";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      db: auth().currentUser.uid,
      onClose: this.props.onClose,
      chats: [],
      visible: false,
      content: '',
      readError: null,
      writeError: null,
      loadingChats: false
    };
    //name = user.displayName;
    //email = user.email;
    //photoUrl = user.photoURL;
    //emailVerified = user.emailVerified;
    //uid = user.uid;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.present = this.present.bind(this);
    this.myRef = React.createRef();
  }

  setChat(uid1,uid2) {
    var db = 'chats';
    var visible = true;
    if (uid1 < uid2) {
      db = db + '_' + uid1 + '_' + uid2;
    }
    else {
      db = db + '_' + uid2 + '_' + uid1;
    }
    console.log("Switching chat db to ",db);
    this.setState({db});
    this.startListening(db);
  }

  setVisible(visible) {
    this.setState({visible});
  }

  async stopListening() {
    const listener = this.state.listener;
    if (listener !== undefined) {
      db.ref(this.state.handle).off('value',this.state.listener);
      this.setState({listener: undefined, handle: undefined});
    }
  }

  async startListening(handle) {
    console.log("Listening on ",handle);
    const chatArea = this.myRef.current;
    this.stopListening();
    this.present();
    try {
      const chat_listener =
        db.ref(handle).on("value", snapshot => {
          console.log("got update on ",db);
          let chats = [];
          snapshot.forEach((snap) => {
            chats.push(snap.val());
          });
          chats.sort(function (a, b) { return a.timestamp - b.timestamp })
          this.setState({ chats });
          chatArea.scrollBy(0, chatArea.scrollHeight);
          this.setState({ loadingChats: false });
        });
      this.setState({ listener: chat_listener, handle: handle });
    } catch (error) {
      console.log('Chat error',error.message);
      this.setState({ readError: error.message, loadingChats: false });
    }
  }

  async componentWillUnmount() {
    this.stopListening();
  }
    
  async componentDidMount() {
    this.setState({ readError: null, loadingChats: true });
    this.present();
    this.startListening(this.state.db);
  }

  present() {
    let user = this.state.user;
    usersRef
    .doc(user.uid)
    .set({
      online: true,
      name: user.displayName,
      pic: user.photoURL,
      email: user.email
    }, { merge: true});
    var ref = db.ref("users/"+user.uid);
    ref.onDisconnect().set("offline");
    ref.set("online");
    console.log(user.displayName+" now present");
  }

  handleChange(event) {
    this.setState({
      content: event.target.value
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    const chatArea = this.myRef.current;
    try {
      await db.ref(this.state.db).push({
        content: this.state.content,
        timestamp: Date.now(),
        uid: this.state.user.uid
      });
      console.log("Chatted to",this.state.db,this.state.content)
      this.setState({ content: '' });
      chatArea.scrollBy(0, chatArea.scrollHeight);
    } catch (error) {
      console.log("Chat error", error.message);
      this.setState({ writeError: error.message });
    }
  }

  formatTime(timestamp) {
    const d = new Date(timestamp);
    const time = `${d.getDate()}/${(d.getMonth()+1)}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    return time;
  }

  handleClose() {
    this.setState({'visible': false});
    if (this.state.onClose) {
      this.state.onClose(this);
    }
  }

  render() {
    var myDisplay = this.state.visible ? 'flex' : 'none';
    return (
      <div className="chatter" style={{display: myDisplay}}>
        <div className="chat-header">
          <button type="button" onClick={this.handleClose} className="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="chat-area" ref={this.myRef}>
          {/* loading indicator */}
          {this.state.loadingChats ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div> : ""}
          {/* chat area */}
          {this.state.chats.map(chat => {
            return <p key={chat.timestamp} className={"chat-bubble " + (this.state.user.uid === chat.uid ? "current-user" : "")}>
              {chat.content}
              <br />
              <span className="chat-time float-right">{this.formatTime(chat.timestamp)}</span>
            </p>
          })}
        </div>
        <form onSubmit={this.handleSubmit}>
          <textarea className="form-control" name="content" onChange={this.handleChange} value={this.state.content}></textarea>
          {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
          <button type="submit" className="btn btn-submit">Send</button>
        </form>

        {/*
        <div className="py-5 mx-3">
          Login in as: <strong className="text-info">{this.state.user.email}</strong>
        </div> */}
      </div>
    );
  }
}