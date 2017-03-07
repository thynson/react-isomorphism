import React = require('react');
import ReactDOM = require('react-dom');


export class PageBuilder<T> {
    private title: string;
    private domReady: Array<()=>void> = [];

    constructor(private pageName: string,
                private componentClass: React.ComponentClass<T>) {
        this.componentClass = componentClass;
        this.title = '';
    }


    appendDomReadyAction(action: ()=>void): this {
        this.domReady.push(action);
        return this;
    }

    build():Page<T> {
        if (typeof document != 'undefined') {
            // Client side
            let metaElement = document.getElementById('x-react-render-args');
            let args = JSON.parse(metaElement.getAttribute('content')) as PageData<T>;
            metaElement.remove();
            let element = React.createElement(this.componentClass, args.data);
            require('domready')(()=>{
                this.domReady.forEach((fn) => {
                    try {
                        fn();
                    } catch (e) {
                        console.error(e);
                    }
                });
                ReactDOM.render(element, document.getElementById('x-react-container'));
            });

        }
        return new Page<T>(this.pageName, this.componentClass);
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
    getBundledAssets(name: string): string
}
export class Page<T> {

    constructor(
        private pageName: string,
        private componentClass: React.ComponentClass<T> ) {
    }

    render(args: PageData<T>, env: RenderMetadata): JSX.Element {
        let htmlAttrs = args.locale != null ? {lang:args.locale} : {};
        return <html {...htmlAttrs}>
        <head>
            <title>{args.title}</title>
            <meta id="x-react-render-args"  content={JSON.stringify(args)}/>
            <script type="application/javascript" src={env.getBundledAssets(this.pageName)}/>
        </head>
        <body>
        <div id="x-react-container">
            <this.componentClass {...args.data}/>
        </div>
        </body>
        </html>;
    }

}
