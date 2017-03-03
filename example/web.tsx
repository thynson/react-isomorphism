import IsomorphicBuilder from '../index';
import React = require('react');

export interface MyState {
    clock: string;
}

class MyComponent extends React.Component<MyState,MyState> {

    constructor(props: MyState, ctx){
        super(props, ctx)
        this.state = props;
    }
    updateTimestamp = ()=> this.setState({clock: new Date().toISOString() });

    render() {

        return <div>
            <p>Hello world</p>
            <button onClick={this.updateTimestamp}>Update</button>
            <p>Timestamp: {this.state.clock}</p>
        </div>;
    }
}

export default new IsomorphicBuilder('web', MyComponent).build();