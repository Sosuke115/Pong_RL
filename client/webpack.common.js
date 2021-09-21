const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'app': path.join(__dirname, 'js', 'frontend', 'main.js'),
        'worker': path.join(__dirname, 'js', 'rl', 'worker.js'),
    },
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/public/',
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
                                        'modules': false,
                                        // 'useBuiltIns': 'usage',
                                        // 'targets': '> 0.25%, not dead',
                                        // 'corejs': 3
                                    }
                                ]
                            ],
                            plugins: ['@babel/plugin-transform-runtime'],
                        }
                    }
                ],
            },
        ]
    },
    resolve: {
        alias: {
            '@tensorflow/tfjs$':
                path.resolve(__dirname, './js/custom_tfjs/custom_tfjs.js'),
            '@tensorflow/tfjs-core$':
                path.resolve(__dirname, './js/custom_tfjs/custom_tfjs_core.js'),
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery'
        }),
    ],
};
