
// import them for a naive web server
import http = require ('http');
import fs = require('fs');

// the demo page
import Page, {PageState} from './page';

// import for configuring the render function
import Renderer from '../renderer';

// Import the assets map generated by webpack, so we know the real URLs of the bundled scripts
import assetsMap = require('./assets-map');
let enableXHTML = false;

let renderer = new Renderer.Builder()
    .setEnableXHTML(enableXHTML)
    .setAssetsUrlMap((x)=> assetsMap[x].js ).build();

let server = http.createServer((req, res)=> {
    if (req.url == '/') {
        // Return rendered page
        res.statusCode = 200;
        let contentType = enableXHTML ? 'application/xhtml+xml; charset=utf-8' : 'text/html; charset=utf-8';
        res.setHeader('content-type', contentType);
        let content = renderer(Page, {title: 'test', data: { clock: new Date().toISOString() }});
        console.log(content)
        res.end(content);
    } else {
        // Return script-bundle in the assets dir, in real-world application
        // you should use a static file serving component such to do this
        let file =  fs.createReadStream('.'+req.url);
        file.on('open', ()=> {

            file.removeAllListeners('error'); // If file has been opened, just let it crash for any error
            res.statusCode = 200;
            res.setHeader('content-type', 'application/javascript');
            file.pipe(res);
        }).on('error', ()=> {
            // Return 404 for any error before open
            res.statusCode = 404;
            res.end('Not Found');
        })
    }

}).listen(0, 'localhost', () => {
    // Listen on random port and display the actual address this demo server is listen to
    console.log('server started at http://%s:%s/', server.address().address, server.address().port);
});
