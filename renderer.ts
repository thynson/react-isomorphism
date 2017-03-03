import IsomorphicBuilder from '.';
import reactDomServer = require('react-dom/server');

abstract class Renderer {

    abstract getBundledAssets(pageName: string): string;

    build() {
        return <T>(target: IsomorphicBuilder.RenderTarget<T>, args: IsomorphicBuilder.PageData<T>): string => {
            return reactDomServer.renderToStaticMarkup(target.render(args, {
                getBundledAssets: (x:string)=> this.getBundledAssets(x),
            }));
        };
    }
}

export default Renderer;
