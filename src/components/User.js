
import React, { Component } from "react";

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
        this.state = {
            nickname: nickname,
            email: email,
            avatar: avatar
        };
        console.log("New user");
        console.log(this.state);
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

    render() {
        var firstName = this.state.nickname;
        if (firstName === undefined) firstName = "Unknown ";
        firstName = firstName.split(" ")[0];

        return (

            <div className="UserClass" onClick={this.handleClick}>
                <div className="User-avatar">
                    <img src={this.state.avatar} alt={this.state.nickname} title={this.state.email} />
                </div>
                <div className="User-nickname">
                    {firstName}
                </div>
            </div>

        );
    }
}

export default User;