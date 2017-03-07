/**
 * This file defines a page and export its render function
 */

import * as ri from '../index';
import React = require('react');

export interface PageState {
    clock: string;
}

class PageComponent extends React.Component<PageState,PageState> {

    state = this.props;

    updateTimestamp = ()=> this.setState({clock: new Date().toISOString() });

    render() {

        return <div>
            <p>Hello world</p>
            <button onClick={this.updateTimestamp}>Update</button>
            <p>Timestamp: {this.state.clock}</p>
        </div>;
    }
}

export default new ri.PageBuilder('page', PageComponent)
    .appendDomReadyAction(()=>{
        require('./style.scss');
    })
    .build();