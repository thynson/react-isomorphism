'use strict'
const AssetsPlugin = require('assets-webpack-plugin');
const webpack = require('webpack');
module.exports = (env) => {
    return {
        entry: {page: './page.tsx'},
        output: {
            filename: './assets/[name].[contenthash].js'
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.json']
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/, loader: 'ts-loader'
                },
                {
                    test: /\.scss?$/,
                    use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader" // compiles Sass to CSS
                        }
                    ]
                }
            ]
        },
        optimization: {
            minimize: env === 'production',
            splitChunks: {
                chunks: 'all'
            }
        },
        mode: 'production',
        plugins: [
            new AssetsPlugin({filename: './assets-map.json', prettyPrint: true, path: '.', entrypoints: true}),
            // new webpack.DefinePlugin({
            //     'process.env': {
            //         'NODE_ENV': '"production"'
            //     }
            // })
        ]
    }
};
