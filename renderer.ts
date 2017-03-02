import IsomorphicBuilder from '.';
import reactDomServer = require('react-dom/server');

abstract class Renderer {

    abstract getBundleForPage(pageName: string): string;
    abstract getAssetsUrl(assetsName: string): string

    build() {
        return <T>(target: IsomorphicBuilder.RenderTarget<T>, args: IsomorphicBuilder.PageData<T>): string => {
            return reactDomServer.renderToStaticMarkup(target.render(args, {
                assetsMap: (x:string)=> this.getBundleForPage(x),
                assetsUrlTransformer: (x: string)=> this.getAssetsUrl(x),
            }))
        }

    }
}

export default Renderer;
