/**
 * This file defines a page and export its render function
 */

import Isomorphism from '..';
import React from 'react';
import {combineReducers, createStore} from "redux";
import {connect, Provider} from 'react-redux'
import {BrowserRouter, Link, StaticRouter} from 'react-router-dom';
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


export interface PageProps {
    clock: number;
    list: { updatedTimestamp: number }[]
    onClicked: (idx) => any;
}

const App = connect((state: { app: AppState }) => {
    return state.app;
}, (dispatch) => {
    return {
        onClicked: (payload) => dispatch({type: 'PAGE_BUTTON_CLICK', payload})
    }
})(
    class PageComponent extends React.Component<PageProps> {
        // history = createBrowserHistory();
        //
        // componentDidMount(): void {
        //     this.store.subscribe(()=> {
        //         this.setState(this.store.getState());
        //     });
        // }


        render() {
            return (<div>
                {
                    this.props.list.map((item, idx) => {
                        return <div key={idx}>
                            UpdatedTime: {new Date(item.updatedTimestamp).toISOString()}
                            <button onClick={() => this.props.onClicked(idx)}>Click
                            </button>
                        </div>
                    })
                }
                <Link to="/missing">link</Link>
            </div>);
        }
    });

const page = new Isomorphism.Builder('page', (args: AppState, isBrowserSide) => {
    const app = (<Switch>
        <Route exact path="/" render={() => <App/>}/>
        <Route exact path="/missing" render={() => <div>missing</div>}/>
    </Switch>)

    const rootReducer = combineReducers({app: updateReducer});
    const store = createStore(rootReducer, {app: args});
    if (isBrowserSide) {
        return (<Provider store={store}>
            <BrowserRouter>
                {app}
            </BrowserRouter>

        </Provider>);
    } else {
        return (<Provider store={store}>
            <StaticRouter location="/" context={{}}>
                {app}
            </StaticRouter>

        </Provider>);

    }
})
    .appendInitAction(() => {
        require('./style.scss');
    })
    .appendDomReadyAction(() => {
        alert("page loaded");
    })
    .build();


export default page;
