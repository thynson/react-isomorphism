import http = require ('http');
import fs = require('fs');
import RenderBuilder from '../renderer';
import assetsMap = require('./assets-map');
import {default as MyWeb, MyState} from './web';
console.dir(assetsMap);

class MyRenderer extends RenderBuilder {

    getBundledAssets(pageName: string): string {
        return assetsMap[pageName].js;
    }

}

let renderer = new MyRenderer().build();

let server = http.createServer((req, res)=> {
    if (req.url == '/') {
        res.statusCode = 200;
        let state: MyState = { clock: new Date().toISOString()};
        res.end(renderer(MyWeb, {title: 'test', data: state}));
    } else {
        let outputStream =  fs.createReadStream('.'+req.url);
        outputStream.on('error', (e)=> {
            res.statusCode = 502;
            res.end('Error');
        });
        outputStream.on('open', ()=> {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/javascript');
            outputStream.pipe(res);
        })
    }

}).listen(0, 'localhost', () => {
    console.log('server started at http://%s:%s/', server.address().address, server.address().port);
});