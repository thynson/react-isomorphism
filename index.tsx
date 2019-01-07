import React from 'react';
import ReactDOM from 'react-dom';
import whenDomReady from 'when-dom-ready';

interface Isomorphism<T> {
    pageName: string;

    render(args: T): JSX.Element;
}

namespace Isomorphism {

    export class Builder<T> {
        private _initAction: Array<() => void> = [];
        private _domReady: Array<() => void> = [];


        constructor(private pageName: string,
                    private readonly renderer: (args: T, isBorserSide: boolean) => JSX.Element,
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
                        args = JSON.parse(dataElement.getAttribute('content')) as T;
                    dataElement.remove();
                } catch (e) {
                    console.error(e.message);
                    alert('Page is not setup properly');
                }
                let element = this.renderer(args, true);
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
            return new ReactPage<T>(this.pageName, this.renderer);
        }
    }
}


export default Isomorphism;

class ReactPage<T> {


    constructor(
        public pageName: string,
        private renderer: (args: T, isBrowserSide: boolean) => JSX.Element) {
    }

    render(args: T): JSX.Element {
        return this.renderer(args, false);
    }

}
