import React, {Component} from 'react';
import './LowerThird.css';

class LowerThird extends Component {

    constructor(props) {
        super(props);
        console.log("l3prop",props);
        const name = this.props.name;
        const email = this.props.email;
        const id = this.props.id;
        this.state = {
            id: id,
            name: name,
            email: email
        };
    };

    setInfo(name,email) {
        this.setState({name, email});
        //console.log("Label received",name,email);
    };

render() {
    var id = this.props.id;
    var name = this.state.name;
    var email = this.state.email;
    return (
        <div id={id} className="main">
            <div id="animation-1" className="animation">
                <div className="white light mask">
                    <div>{name}</div>
                </div>
                <div className="white light mask email">
                    <div>{email}</div>
                </div>
            </div>
        </div>
    )
}
};

export default LowerThird;