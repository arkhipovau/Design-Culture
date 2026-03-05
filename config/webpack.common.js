const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const ROOT = path.resolve(__dirname, '..');

module.exports = {
  context: ROOT,
  entry: {},
  output: {
    path: path.resolve(ROOT, 'docs'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(ROOT, 'src'),
          to: path.resolve(ROOT, 'docs'),
          globOptions: {
            ignore: ['**/.DS_Store']
          }
        }
      ]
    })
  ]
};
