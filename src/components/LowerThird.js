import React, { Component } from 'react';
import './LowerThird.css';

class LowerThird extends Component {

    constructor(props) {
        super(props);
        console.log("l3prop", props);
        const name = this.props.name;
        const email = this.props.email;
        const id = this.props.id;
        const image = this.props.image;
        this.state = {
            id: id,
            name: name,
            email: email,
            image: image
        };
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

    render() {
        var id = this.props.id;
        var name = this.state.name;
        var email = this.state.email;
        var image = this.state.image;
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
            </div>
        )
    }
};

export default LowerThird;