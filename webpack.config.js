const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dev_build'), filename: 'index.js' },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};
