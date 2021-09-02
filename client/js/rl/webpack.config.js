const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: 'development',
    entry: {
        'train': path.join(__dirname, 'train.js'),
        'test': path.join(__dirname, 'test.js'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/js/rl/dist/',
        filename: `[name].bundle.js`,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        'modules': 'commonjs',//commonjs,amd,umd,systemjs,auto
                                        'useBuiltIns': 'usage',
                                        'targets': '> 0.25%, not dead',
                                        'corejs': 3
                                    }
                                ]
                            ]
                        }
                    }
                ]
            },
        ]
    },
    resolve: {
        alias: {}
    },
    plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery'
        }),
        // new BundleAnalyzerPlugin(),
    ],
    devtool: "eval-source-map",
};
