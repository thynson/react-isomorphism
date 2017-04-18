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
        // Emulate a large page

        let x = [];
        for (let i = 0; i < 1000; i++) {
            x.push(i);
        }

        return <div>
            {
                x.map((x)=> {
                    return <div>
                        <p>Hello world ${x}</p>
                        <button onClick={this.updateTimestamp}>Update</button>
                        <p>Timestamp: {this.state.clock}</p>
                    </div>;
                })
            }

        </div>;
    }
}

export default new ri.PageBuilder('page', PageComponent)
    .appendInitAction(()=>{
        require('./style.scss');
    })
    .appendDomReadyAction(()=>{
        alert("page loaded");
    })
    .build();