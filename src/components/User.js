
import React, { Component } from "react";
import {
    CircularProgressbarWithChildren,
    buildStyles
  } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

//name = user.displayName;
//email = user.email;
//photoUrl = user.photoURL;
//emailVerified = user.emailVerified;
//uid = user.uid;

class User extends Component {

    constructor(props) {
        super(props);
        const user = this.props.data;
        const nickname = user.name;
        const avatar = user.pic;
        const email = user.email;
        const prog = user.progress;
        this.state = {
            nickname: nickname,
            email: email,
            avatar: avatar,
            progress: prog
        };
        this.myRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
    };

    handleClick() {
        var peerId = this.props.data.peer;
        var onSelect = this.props.onSelect;
        if (peerId !== undefined) {
            onSelect(peerId);
        }
    };

    componentDidUpdate() {
        const lastP = this.state.progress;
        const thisP = this.props.data.progress;
        if (thisP !== lastP) {
            this.setState({'progress': thisP});
        }
    };

    render() {
        var firstName = this.state.nickname;
        var progress = this.state.progress;
        if (firstName === undefined) firstName = "Unknown ";
        if (progress === undefined) progress = 1.0;
        const pct = Math.floor(progress*100);
        firstName = firstName.split(" ")[0];
        return (
            <div className="UserClass" onClick={this.handleClick}>
                <CircularProgressbarWithChildren value={pct}>
                <div className="User-avatar">
                    <img src={this.state.avatar} title={this.state.email} />
                </div>
                </CircularProgressbarWithChildren>
            </div>

        );
    }
}

export default User;