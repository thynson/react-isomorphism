# react-isomorphism

This library provides elegant utilities for build react web page and renderer 
that can be used in both server side and client side, a.k.a. isomorphic 
rendering, and this library should be friendly with resource bundler like 
webpack and CDN.

This library is written in Typescript and ships with type definitions.
You can also use it with plain Javascript, however, you need to take 
care of the module interoperability between ES6 and CommonJS.

## Install

```bash
npm i react-isomorphism react react-dom --save
```

`react` and `react-dom` are peer dependencies of this library. You may
want to install `@types/react` and `@types/react-dom` as well if you
also use Typescript.

## Example Usage

The following steps show you how to use this library and integrate with 
webpack in Typescript.  

1. Setting up webpack

    ```javascript
    var AssetsPlugin = require('assets-webpack-plugin');
    var webpack = require('webpack');
    module.exports = {
        entry: { home: './home-page.tsx' },
        output: {
            filename: './assets/[name].[chunkhash].js'
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.json']
        },
        devtool: 'source-map',
        module: {
            loaders: [
                {
                    test: /\.tsx?$/, loader: 'ts-loader'
                },
                // ...
            ]
        },
        plugins: [
            new AssetsPlugin({filename: './assets-map.json', prettyPrint: true, path: '.'}),
        ]
    };
    ```
    
    This example webpack config file only contains one entry of `home`, usually
    you have to define more entries. The output filename are postfixed with 
    chunck hash so it should be safe to enable long-term cache if you use a 
    CDN.
    
    Note that `assets-webpack-plugin` is required to dump an assets map. So 
    that we can find the correct bundle file by entry name. 
    
2. Define Your Page
    
    ```typescript
    
    import Isomorphism from 'react-isomorphism';
    import * as React form 'react';
    //...
    export interface HomePageProperties {
        // ...
    }
 
    interface HomePageState {
        // ...
    }
    class HomePageComponent extends React.Component<HomePageProperties, HomePageState> {
        // ...
    }
    
    export default Isomorphism.Builder('home', HomePageComponent)
       .appendInitAction(()=> require('style.css'))     // Stylesheet of this page
       .appendDomReadyAction(()=> require('analytics')) // Analytics scripts
       .build();
    ```

    Here we define an isomorphic render target for you home page.

    Note that functions passed to `appendInitAction` and `appendDomReadyAction` 
    are only be executed in browser side, before DOM is going to constructed 
    and after DOM gets ready. **We need to require them here so that they won't
    be actually required on server side while be able to be scanned and bundled
    by Webpack**.

3. Render it in your application

    Assume you put the above resources in a seperated module named 
    `example-web`, and importing them in your server application.

    ```typescript
    import Renderer from 'react-isomorphism/render'
    import HomeTemplate = require('example-web/home-page')
    import AssetsMap = require('example-web/assets-map');
    
    let renderer = new Renderer.Builder()
        .setAssetsUrlMap((x)=> AssetsMap[x].js)
        .build();

    let html = render(HomeTemplate, {
        title: '',
        data: {
            ...
        }
    });
    console.log(html);

    ```

    Here we build a renderer and use it to render the home page.

    If you want to deliver the assets through CDN, you can transform the 
    assets url in the function passed to `setBundledAssetsUrlMap`.

    
## License
The ISC License
