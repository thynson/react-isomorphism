import React = require('react');
import ReactDOM = require('react-dom');


class IsomorphicBuilder<T> {
    private title: string;
    private domReady: Array<()=>void> = [];

    constructor(private pageName: string,
                private componentClass: React.ComponentClass<T>) {
        this.componentClass = componentClass;
        this.title = '';
    }


    setTitle(title:string): this {
        this.title = title;
        return this;
    }

    onBrowserSide(ready: ()=>void): this {
        this.domReady.push(ready);
        return this;
    }

    build():IsomorphicBuilder.RenderTarget<T> {
        if (typeof document != 'undefined') {
            // Client side
            let metaElement = document.getElementById('x-react-render-args');
            let args = JSON.parse(metaElement.getAttribute('content')) as IsomorphicBuilder.PageData<T>;
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
        return new IsomorphicBuilder.RenderTarget<T>(this.pageName, this.componentClass);
    }
}

namespace IsomorphicBuilder {
    export interface PageData<T> {
        title: string;
        locale?: string
        data: T;
    }

    export interface RenderMetadata {
        assetsUrlTransformer(assetsUrl: string): string;
        assetsMap(name: string): string
    }
    export class RenderTarget<T> {

        constructor(
            private pageName: string,
            private componentClass: React.ComponentClass<T> ) {
        }

        render(args: IsomorphicBuilder.PageData<T>, env: IsomorphicBuilder.RenderMetadata): JSX.Element {
            let htmlAttrs = args.locale != null ? {lang:args.locale} : {};
            return <html {...htmlAttrs}>
                <head>
                    <title>{args.title}</title>
                    <meta id="x-react-render-args"  content={JSON.stringify(args)}/>
                    <script type="application/javascript" src={env.assetsMap(this.pageName)}/>
                </head>
                <body>
                    <div id="x-react-container">
                        {React.createElement(this.componentClass, args.data)}
                    </div>
                </body>
            </html>;
        }

    }
}


export default IsomorphicBuilder;