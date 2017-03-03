import * as ri from '.';
import reactDomServer = require('react-dom/server');

export default class Renderer {


    private bundledAssetsMap: (pageName: string)=> string;

    setBundledAssetsMap(map: (pageName: string)=> string): this {
        this.bundledAssetsMap = map;
        return this;
    }

    build() {
        return <T>(target: ri.Page<T>, args: ri.PageData<T>): string => {
            return reactDomServer.renderToStaticMarkup(target.render(args, {
                getBundledAssets: (x:string)=> this.bundledAssetsMap(x),
            }));
        };
    }
}
