import Isomorphism from '.';
import * as ReactDomServer from 'react-dom/server';
import * as React from 'react';

interface Renderer {
    <T> (target: Isomorphism<T>, parameter: Renderer.Parameter<T>, output: NodeJS.WritableStream): void
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
        HTML5: '<!DOCTYPE html>\n'
    }
}

namespace Renderer {
    export class Builder {


        private assetsUrlMap: (pageName: string)=> string[];
        private docType: string = Renderer.DocumentType.HTML5;
        private enableXHTML: boolean = false;
        private metadata: Renderer.MetadataTable = {};

        setAssetsUrlMap(map: (pageName: string)=> string[]): this {
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
            return function <T> (this: undefined,
                                 target: Isomorphism<T>,
                                 args: Renderer.Parameter<T>,
                                 output: NodeJS.WritableStream){

                let htmlAttrs = {};
                if (self.enableXHTML){
                    htmlAttrs['xmlns'] = "http://www.w3.org/1999/xhtml";
                    if (args.locale)
                        htmlAttrs['xml:lang'] = args.locale
                } else {
                    if (args.locale)
                        htmlAttrs['lang'] = args.locale
                }
                let meta = self.metadata;
                let content = ReactDomServer.renderToString(target.render(args.data));
                let json = JSON.stringify(args.data);
                let argumentHolder;
                if (self.enableXHTML) {
                    // We don't need to escape " and ' in > in script content
                    // Only escape & and < manually to minify the size
                    let __html = json.replace(/&/g, '&amp;').replace(/</g, '&lt;');
                    argumentHolder = <script id='x-render-args-holder'
                        type='application/json'
                        dangerouslySetInnerHTML={{__html}} />

                } else {
                    argumentHolder = <meta id='x-render-args-holder' name='x-render-args-holder' content={json}/>
                }
                let htmlElement = (
                    <html {...htmlAttrs} >
                        <head>
                            <title>{args.title}</title>
                            {argumentHolder}
                            {
                                Object.keys(meta).map((key, idx) => {
                                    return <meta key={`meta-${idx}`} name={key} content={meta[key]}/>;
                                })
                            }
                            {
                                self.assetsUrlMap((target.pageName)).map((scriptName, idx)=> {
                                    return <script key={`script-${idx}`} type='application/javascript' src={scriptName}/>
                                })
                            }
                        </head>
                        <body>
                            <div id="x-react-container" dangerouslySetInnerHTML={{__html: content}} />
                        </body>
                    </html>
                );
                output.write(self.docType);
                ReactDomServer.renderToNodeStream(htmlElement).pipe(output);
            }
        }
    }
}

export default Renderer;

