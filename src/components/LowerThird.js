import React, { Component } from 'react';
import './LowerThird.css';

class LowerThird extends Component {

    constructor(props) {
        super(props);
        const name = this.props.name;
        const email = this.props.email;
        const id = this.props.id;
        const image = this.props.image;
        this.state = {
            id: id,
            onChat: this.props.onChat,
            onLike: this.props.onLike,
            name: name,
            email: email,
            image: image
        };
        this.handleClick = this.handleClick.bind(this);
    };

    setInfo(name, email, image) {
        this.setState({ name, email, image });
        //console.log("Label received",name,email);
    };

    renderEmpty(id) {
        return (
            <div id={id} className="main lower3rd">
            </div>
        );
    };

    handleClick() {
        console.log("heard click on ",this.state);
        if (this.state.onLike) {
            this.state.onLike(this);
        }
        else {
            this.state.onChat(this);
        }
    }

    render() {
        var id = this.props.id;
        var name = this.state.name;
        var email = this.state.email;
        var image = this.state.image;
        var icon = 'icon-comments';
        if (this.state.onLike) {
            icon = 'icon-heart';
        }
        if (this.state.name === '' || this.state.name == undefined) {
            return this.renderEmpty(id);
        }
        return (
            <div id={id} className="main lower3rd">
                <img src={image} />
                <div className="name">
                {name} 
                </div>
                <div className="email">
                {email}
                </div>
                <div className="icons">
                    <a onClick={this.handleClick}>
                    <i className={icon}></i>
                    </a>
                </div>
            </div>
        )
    }
};

export default LowerThird;