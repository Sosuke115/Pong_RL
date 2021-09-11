const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    optimization: {
        usedExports: true,  // enable tree shaking
    },
    plugins: [
        new BundleAnalyzerPlugin(),
    ],
    devtool: "eval-source-map",
});
