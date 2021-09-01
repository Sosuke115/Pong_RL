const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: {
        app: './client/js/frontend/main.js',
        train: './client/js/rl/train.js',
        test: './client/js/rl/test.js',
    },
    output: {
        path: path.join(__dirname, 'client/dist'),
        publicPath: '/js/',
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
            {
                test: /worker\.js$/,
                loader: "worker-loader",
                options: {
                    inline: "fallback"
                },
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
        })
    ],
    devtool: "eval-source-map",
};