import React, { Component } from "react";
import { debounce } from 'lodash';

export class CanvasDraw extends Component {

	constructor(props) {
		super(props);
		this.state = { resizing: true };

		const resize = () => { this.setState({ resizing: true }); };
		// Because the resize event can fire very often, we
		// add a debouncer to minimise pointless
		// (unmount, resize, remount)-ing of the child nodes.
        this.setResize = debounce(resize, 500);
        this.myRef = React.createRef();
        this.id = this.props.id;
        if (this.id === undefined) this.id = 'canvas';
	}

	componentDidMount() {
        console.log("c mount", this.myRef);
		window.addEventListener('resize', this.setResize);
		this.setState({ resizing: false });
		const canvas = this.myRef.current;
		if (canvas !== null) {
			var div = canvas.parentElement;
        	const width = div.offsetWidth;
       	    const height = div.offsetHeight;
			this.setState({ width, height});
		}
		else {
			console.log("canvas - null parent div");
		}
	}

	componentWillUnmount() {
        console.log("c unmount", this.myRef);
		window.removeEventListener('resize', this.setResize);
	}

	componentDidUpdate(prevProps, prevState) {
		// god this is ugly
		const canvas = this.myRef.current;
		const resizingDone = !prevState.resizing && this.state.resizing;
		if (canvas === null) {
			if (resizingDone) {
				this.setState({'resizing': false, 'width': undefined});
			}
			return;
		}
		const div = canvas.parentElement;
		if (this.state.width == undefined || resizingDone) {
            const width = div.offsetWidth;
            const height = div.offsetHeight;
			const resizing = false;
            this.setState({ resizing, width, height});
		}
		if (canvas !== null) {
			canvas.width = this.state.width;
			canvas.height = this.state.height;
		}
    }

	render() {
		if (this.state === undefined) {
			return null;
		}
		const vis = (this.props.visible === undefined || this.props.visible === true);
		//console.log("vis",vis);
        return this.state.resizing ? null : 
        (<canvas id={this.id}
                ref={this.myRef}
				width={this.state.width}
                height={this.state.height}
                onClick={this.props.onClick}
				style={{
					display: vis ? 'flex' : 'none',
                    backgroundColor: 'black',
					width: '100%',
                    height: '100%'
				}} />);

	}
};

export default CanvasDraw;