import React, {Component} from 'react';
import './CallProgress.css';

class CallProgress extends Component {

    constructor(props) {
        super(props);
        const id = this.props.id;
        const progress = this.props.progress;
        this.state = {
            id: id,
            progress: progress
        };
    };

render() {
    var id = this.props.id;
    var name = this.state.name;
    var email = this.state.email;
    var p = Math.floor(this.props.progress*100);
    var progStyle = {'width': String(p)+'%'};
    //console.log("prog",progStyle);
    return (
        <div id={id} className="progressOuter">
            <div className="progressInner" style={progStyle}>
            </div>
        </div>
    )
};

};

export default CallProgress;