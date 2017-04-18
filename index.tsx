import React = require('react');
import ReactDOM = require('react-dom');


export class PageBuilder<T> {
    private _initAction: Array<()=>void> = [];
    private _domReady: Array<()=>void> = [];

    constructor(private pageName: string,
                private componentClass: React.ComponentClass<T>) {
        this.componentClass = componentClass;
    }


    appendDomReadyAction(action: ()=>void): this {
        this._domReady.push(action);
        return this;
    }

    appendInitAction(action: ()=>void):this {
        this._initAction.push(action);
        return this;
    }

    build():Page<T> {
        if (typeof document != 'undefined') {
            // Client side
            this._initAction.forEach((fn)=> {
                try {
                    fn();
                } catch(e) {
                    console.error(e);
                }
            });

            let metaElement = document.getElementById('x-react-render-args');
            let args = JSON.parse(metaElement.getAttribute('content')) as PageData<T>;
            metaElement.remove();
            let element = React.createElement(this.componentClass, args.data);
            require('domready')(()=>{
                this._domReady.forEach((fn) => {
                    try {
                        fn();
                    } catch (e) {
                        console.error(e);
                    }
                });
                ReactDOM.render(element, document.getElementById('x-react-container'));
            });

        }
        return new ReactPage<T>(this.pageName, this.componentClass);
    }
}

namespace PageBuilder {
}

export interface PageData<T> {
    title: string;
    locale?: string
    data: T;
}

export interface RenderMetadata {
    getBundledAssets(name: string): string;
    renderToString(elements: JSX.Element): string;
}
export interface Page<T> {
    render(args: PageData<T>, env: RenderMetadata): JSX.Element;
}
class ReactPage<T> {

    constructor(
        private pageName: string,
        private componentClass: React.ComponentClass<T> ) {
    }

    render(args: PageData<T>, env: RenderMetadata): JSX.Element {
        let htmlAttrs = args.locale != null ? {lang:args.locale} : {};
        let elementsHtml = env.renderToString(<this.componentClass {...args.data}/>);
        return <html {...htmlAttrs}>
        <head>
            <title>{args.title}</title>
            <meta id="x-react-render-args"  content={JSON.stringify(args)}/>
            <script type="application/javascript" src={env.getBundledAssets(this.pageName)}/>
        </head>
        <body>
        <div id="x-react-container" dangerouslySetInnerHTML={{__html: elementsHtml}}/>
        </body>
        </html>;
    }


}
