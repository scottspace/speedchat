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
        const width = window.innerWidth*0.5;
        const height = window.innerHeight;
        this.setState({ width, height});
        this.draw();
	}

	componentWillUnmount() {
        console.log("c unmount", this.myRef);
		window.removeEventListener('resize', this.setResize);
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.resizing && this.state.resizing) {
            const width = window.innerWidth*0.5;
            const height = window.innerHeight;
			const resizing = false;
            this.setState({ resizing, width, height});
		}
		const canvas = this.myRef.current;
		if (canvas !== null) {
			canvas.width = this.state.width;
			canvas.height = this.state.height;
		}
    }
    
    // Relies on a ref to a DOM element, so only call
	// when canvas element has been rendered!
	draw() {
		if (this.state && this.myRef.current) {
			const { width, height} = this.state;
            const canvas = this.myRef.current;
			let context = canvas.getContext('2d');
			// store width, height and ratio in context for paint functions
			context.width = width;
			context.height = height;
			// should we clear the canvas every redraw?
			if (this.props.clear) { context.clearRect(0, 0, canvas.width, canvas.height); }
			this.props.paint(context);
		}
		// is the provided paint function an animation? (not entirely sure about this API)
		if (this.props.loop) {
			window.requestAnimationFrame(this.draw);
		}
	}

	render() {
		if (this.state === undefined) return null;
		
        return this.state.resizing ? null : 
        (<canvas id={this.id}
                ref={this.myRef}
				width={this.state.width}
                height={this.state.height}
                onClick={this.props.onClick}
				style={{
                    backgroundColor: 'black',
					width: '50%',
                    height: '100%'
				}} />);

	}
};

export default CanvasDraw;