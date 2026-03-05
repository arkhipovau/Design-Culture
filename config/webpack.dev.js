const path = require('path');
const common = require('./webpack.common');

module.exports = {
  ...common,
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, '../docs')
    },
    port: 8080,
    open: true,
    hot: false,
    liveReload: true,
    watchFiles: [path.resolve(__dirname, '../src/**/*')]
  }
};
