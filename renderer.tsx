import Isomorphism from '.';
import * as ReactDomServer from 'react-dom/server';
import * as React from 'react';

interface Renderer {
    <T> (target: Isomorphism<T>, parameter: Renderer.Parameter<T>): string
}

namespace Renderer {

    export interface MetadataTable {
        [name: string]: string
    }

    export interface Parameter<T> {
        title: string;
        locale?: string;
        metadata?: MetadataTable;
        data: T;
    }

    export const DocumentType = {
        HTML5: '<!doctype html>\n'
    }
}

namespace Renderer {
    export class Builder {
    
    
        private assetsUrlMap: (pageName: string)=> string;
        private docType: string = Renderer.DocumentType.HTML5;
        private enableXHTML: boolean = false;
        private metadata: Renderer.MetadataTable = {};

        setAssetsUrlMap(map: (pageName: string)=> string): this {
            this.assetsUrlMap = map;
            return this;
        }

        setDocumentType(docType: string): this {
            if (docType[docType.length-1] != '\n')
                docType = docType + '\n';
            this.docType = docType;
            return this;
        }
        
        setEnableXHTML(enabled: boolean): this{
            this.enableXHTML = enabled;
            return this;
        }

        setMetadata(name: string, value: string): this{
            this.metadata[name] = value;
            return this;
        }
    
        build(): Renderer {

            let self = this; // Typescript bug??? workaround for <T>()=> {...} recognized as JSX syntax
            return function <T> (this: undefined, target: Isomorphism<T>, args: Renderer.Parameter<T>): string {

                let htmlAttrs = {};
                if (self.enableXHTML){ 
                    htmlAttrs['xmlns'] = "http://www.w3.org/1999/xhtml";
                    if (args.locale)
                        htmlAttrs['xml:lang'] = args.locale
                } else {
                    if (args.locale)
                        htmlAttrs['lang'] = args.locale
                }
                console.log(htmlAttrs);
                let meta = self.metadata;
                let content = ReactDomServer.renderToString(target.render(args.data));
                let htmlElement = <html {...htmlAttrs} >
                            <head>
                                <title>{args.title}</title>
                                {
                                    Object.keys(meta).forEach(key=> <meta name={key} content={meta[key]}/> )
                                }
                                <script id="x-react-render-args" type='application/json'>
                                    {JSON.stringify(args.data)}
                                </script>

                                <script type='application/javascript' src={self.assetsUrlMap(target.pageName)} />
                            </head>
                            <body>
                                <div id="x-react-container" dangerouslySetInnerHTML={{__html: content}} />
                            </body>
                        </html>;
                let htmlContent = ReactDomServer.renderToStaticMarkup(htmlElement);
                return self.docType + htmlContent;
            }
        }
    }
}

export default Renderer;

