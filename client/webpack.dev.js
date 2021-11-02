const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { merge, mergeWithRules } = require("webpack-merge");
const common = require("./webpack.common.js");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var assert = assert || require("assert");

// add scss compile rule
common.module.rules.push({
  test: /\.scss/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    // bundle css
    {
      loader: "css-loader",
      options: {
        url: true,
        importLoaders: 2,
        sourceMap: true,
      },
    },
    // bundle sass
    {
      loader: "sass-loader",
      options: {
        sourceMap: true,
      },
    },
  ],
});

module.exports = merge(common, {
    mode: "development",
    optimization: {
      usedExports: true, // enable tree shaking
    },
    plugins: [new BundleAnalyzerPlugin()],
    devtool: "eval-source-map",
  });
