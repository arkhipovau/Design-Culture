
const path = require('path');
const glob = require('fast-glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const chunkMap = {
  'pages/sphere.html': ['sphere'],        
};

function makeHtmlPlugins() {
  // 1) главная
  const plugins = [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index'],
      inject: 'body',
    }),
  ];

  // 2) все внутренние страницы
  const files = glob.sync('src/pages/**/*.html', { dot: false });
  files.forEach((abs) => {
    const rel = path.posix.normalize(abs.replace(/^src\//, ''));
    const chunks = chunkMap[rel] || ['index']; 
    plugins.push(
      new HtmlWebpackPlugin({
        template: `./src/${rel}`,
        filename: rel,      
        chunks,
        inject: 'body',
      })
    );
  });

  return plugins;
}

module.exports = makeHtmlPlugins;
