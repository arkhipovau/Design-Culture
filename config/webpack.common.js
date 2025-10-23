// config/webpack.common.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Базовый префикс для GitHub Pages project site:
const BASE_PATH = process.env.BASE_PATH || '/Design-Culture/';

module.exports = {
  entry: {
    index: './src/index.js',
    sphere: './src/sphere.js',
  },
  output: {
    path: path.resolve(__dirname, '..', 'docs'),
    filename: '[name].[contenthash:8].js',
    publicPath: BASE_PATH,                  // 👈 ВАЖНО: абсолютный префикс
    clean: true,
    assetModuleFilename: 'images/[hash][ext][query]',
  },
  module: {
    rules: [
      { test: /\.html$/i, loader: 'html-loader' },
      {
        test: /\.(js|jsx)$/i, exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env','@babel/preset-react'] } }
      },
      { test: /\.css$/i, exclude: /node_modules/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
      { test: /\.(png|jpe?g|svg|webp|gif)$/i, type: 'asset/resource', generator: { filename: 'images/[hash][ext][query]' } },
      { test: /\.(otf|ttf|woff2?)$/i, type: 'asset/resource', generator: { filename: 'fonts/[hash][ext][query]' } },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html', filename: 'index.html', chunks: ['index'], inject: 'body' }),
    new HtmlWebpackPlugin({ template: './src/pages/sphere.html', filename: 'pages/sphere.html', chunks: ['sphere'], inject: 'body' }),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' }),
  ],
};
