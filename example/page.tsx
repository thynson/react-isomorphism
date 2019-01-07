/**
 * This file defines a page and export its render function
 */

import Isomorphism from '..';
import React from 'react';
import {Action, combineReducers, createStore, Reducer} from "redux";
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router';

interface AppState {
    clock: number;
    list: { updatedTimestamp: number }[]
}


function updateReducer(state: AppState, action) {
    if (!state) {
        state = {
            clock: Date.now(),
            list: [],
        }
    }
    console.log('action: ', action, 'state: ', state);
    switch (action.type) {
    case 'PAGE_BUTTON_CLICK':
        const now = Date.now();
        const list = state.list.map((element, idx) => idx === action.payload ? {updatedTimestamp: now} : element);
        return {clock: now, list};
    default:
        return state;
    }
}

// const history = createBrowserHistory()


export interface PageInitState {
    clock: number;
    list: { updatedTimestamp: number }[]
}


class PageComponent extends React.Component<AppState> {
    // history = createBrowserHistory();
    store = this._configureStore(this.props);


    // updateTimestamp = ()=> this.setState({clock: Date.now()});
    // state: Store<PageInitState>;

    // constructor(props: AppState) {
    //     super(props);
    //     // this.state = configureStore(props);
    //
    // }

    // _rootReducer() {
    //     return combineReducers({ router: connectRouter(this.history)})
    // }

    _configureStore(preloadedState: AppState) {
        return createStore(
            this._rootReducer(), // root reducer with router state
            {app: preloadedState},
            // compose(
            //     applyMiddleware(
            //         routerMiddleware(this.history), // for dispatching history actions
            //         // ... other middlewares ...
            //     ),
            // ),
        );
    }

    _rootReducer() {
        const app: Reducer<AppState, Action<String>> = updateReducer;
        return combineReducers({
            // router: connectRouter(this.history),
            app,
        });
    }

    componentDidMount(): void {
        this.store.subscribe(()=> {
            this.setState(this.store.getState());
        });
    }

    renderPage() {
        const state = this.store.getState();
        console.log(state);
        return (<div>
            {
                state.app.list.map((item, idx) => {
                    return <div key={idx}>
                        UpdatedTime: {new Date(item.updatedTimestamp).toISOString()}
                        <button onClick={() => this.store.dispatch({type: 'PAGE_BUTTON_CLICK', payload: idx})}>Click
                        </button>
                    </div>
                })
            }
        </div>);


    }


    render() {
        // Emulate a large page

        // let x = [];
        // for (let i = 0; i < 3; i++) {
        //     x.push(i);
        // }

        return (<Provider store={this.store}>
            {this.renderPage()}
            {/*<ConnectedRouter history={this.history}> { /* place ConnectedRouter under Provider *!/*/}
            {/*<> { /* your usual react-router v4 routing *!/*/}
            {/*<Switch>*/}
            {/*<Route exact path="/" render={(state) => this.renderPage(state)}/>*/}
            {/*<Route render={() => (<div>Miss</div>)}/>*/}
            {/*</Switch>*/}
            {/*</>*/}
            {/*</ConnectedRouter>*/}
        </Provider>);


        // return <div>
        //     {
        //         x.map((x, idx)=> {
        //             return <div key={idx}>
        //                 <p>Hello world {x}</p>
        //                 <button onClick={this.updateTimestamp}>Update</button>
        //                 <p>Timestamp: {this.state.clock}</p>
        //             </div>;
        //         })
        //     }
        //
        // </div>;
    }
}

const page = new Isomorphism.Builder('page', PageComponent)
    .appendInitAction(() => {
        require('./style.scss');
    })
    .appendDomReadyAction(() => {
        alert("page loaded");
    })
    .build();



export default page;
