import Isomorphism from '.';
import reactDomServer = require('react-dom/server');

interface Renderer {
    <T>(target: Isomorphism<T>, parameter: Isomorphism.Parameter<T>): string
}

namespace Renderer {
    export class Builder {
    
    
        private assetsUrlMap: (pageName: string)=> string;
    
        setAssetsUrlMap(map: (pageName: string)=> string): this {
            this.assetsUrlMap = map;
            return this;
        }
    
        build(): Renderer{
            return <T>(target: Isomorphism<T>, args: Isomorphism.Parameter<T>): string => {
                return reactDomServer.renderToStaticMarkup(target.render(args, {
                    getAssetsUrl: (x:string)=> this.assetsUrlMap(x),
                    renderToString: (elements: JSX.Element)=> reactDomServer.renderToString(elements)
                }));
            };
        }
    }
}

export default Renderer;

