var AssetsPlugin = require('assets-webpack-plugin');
var webpack = require('webpack');
module.exports = {
    entry: { page: './page.tsx' },
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
            }
        ]
    },
    plugins: [
        new AssetsPlugin({filename: './assets-map.json', prettyPrint: true, path: '.'}),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        // new webpack.optimize.UglifyJsPlugin()

    ]
};
