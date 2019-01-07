import React from 'react';
import ReactDOM from 'react-dom';
import whenDomReady from 'when-dom-ready';

interface Isomorphism<T> {
    pageName: string;

    render(args: T): JSX.Element;
}

namespace Isomorphism {

    export interface Environment {
        getAssetsUrl(name: string): string;

        renderToString(elements: JSX.Element): string;
    }

    export class Builder<T> {
        private _initAction: Array<() => void> = [];
        private _domReady: Array<() => void> = [];


        constructor(private pageName: string,
                    private readonly componentClass: React.ComponentClass<T>,
                    private readonly renderArgsHolderId = 'x-render-args-holder') {
        }

        appendDomReadyAction(action: () => void): this {
            this._domReady.push(action);
            return this;
        }

        appendInitAction(action: () => void): this {
            this._initAction.push(action);
            return this;
        }

        build(): Isomorphism<T> {
            if (typeof document != 'undefined') {
                // Client side
                this._initAction.forEach((fn) => {
                    try {
                        fn();
                    } catch (e) {
                        console.error(e);
                    }
                });

                let args: T;
                let dataElement = document.getElementById(this.renderArgsHolderId);
                try {
                    if (!dataElement)
                        throw new Error(`Element #${this.renderArgsHolderId} not found`);
                    if (dataElement.tagName.toLowerCase() === 'script')
                        args = JSON.parse(dataElement.innerHTML) as T;
                    else if (dataElement.tagName.toLowerCase() === 'meta')
                        args = JSON.parse(dataElement.getAttribute('content')) as T
                    dataElement.remove();
                } catch (e) {
                    console.error(e.message);
                    alert('Page is not setup properly');
                }
                let element = React.createElement(this.componentClass, args);
                whenDomReady()
                    .then(() => {
                        ReactDOM.hydrate(element, document.getElementById('x-react-container'));
                        this._domReady.forEach((fn) => {
                            try {
                                fn();
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    });
            }
            return new ReactPage<T>(this.pageName, this.componentClass);
        }
    }
}


export default Isomorphism;

class ReactPage<T> {


    constructor(
        public pageName: string,
        private componentClass: React.ComponentClass<T>) {
    }

    render(args: T): JSX.Element {
        return <this.componentClass {...args}/>;
    }

}
