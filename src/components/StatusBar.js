import React, { Component } from 'react';
import './StatusBar.css';

class StatusBar extends Component {

    constructor(props) {
        super(props);
        const id = this.props.id;
        const text = this.props.text;
        this.state = {
            id: id,
            text: text
        };
    };

    status(text) {
        this.setState({ text });
        console.log("Status received",text);
    };

    renderEmpty(id) {
        return (
            <div id={id} className="statusBar">
            </div>
        );
    };

    render() {
        var id = this.props.id;
        var text = this.state.text;
        if (this.state.id === '' || this.state.text == undefined) {
            return this.renderEmpty(id);
        }
        return (
            <div id={id} className="statusBar">
                {this.state.text}
            </div>
        )
    }
};

export default StatusBar;