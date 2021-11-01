const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
          sourceMap: false,
        },
      },
      // bundle sass
      {
        loader: "sass-loader",
        options: {
          sourceMap: false,
        },
      },
    ],
  });

module.exports = merge(common, {
    mode: 'production',
    devtool: "source-map",
});
