const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: {
        'dist/app': './client/js/frontend/main.js',
        'js/rl/train': './client/js/rl/train.js',
        'js/rl/test': './client/js/rl/test.js',
    },
    output: {
        path: path.join(__dirname, 'client'),
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
                    inline: 'no-fallback',
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
