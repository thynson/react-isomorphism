/**
 * This file defines a page and export its render function
 */

import Isomorphism from '..';
import React from 'react';

export interface PageState {
    clock: string;
}

class PageComponent extends React.Component<PageState,PageState> {

    state = this.props;

    updateTimestamp = ()=> this.setState({clock: new Date().toISOString() });


    render() {
        // Emulate a large page

        let x = [];
        for (let i = 0; i < 3; i++) {
            x.push(i);
        }

        return <div>
            {
                x.map((x, idx)=> {
                    return <div key={idx}>
                        <p>Hello world {x}</p>
                        <button onClick={this.updateTimestamp}>Update</button>
                        <p>Timestamp: {this.state.clock}</p>
                    </div>;
                })
            }

        </div>;
    }
}

export default new Isomorphism.Builder('page', PageComponent)
    .appendInitAction(()=>{
        require('./style.scss');
    })
    .appendDomReadyAction(()=>{
        alert("page loaded");
    })
    .build();
