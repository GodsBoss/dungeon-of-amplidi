var HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  "mode": "production",
  "entry": "./src/init.js",
  plugins: [new HtmlWebpackPlugin()]
}

module.exports = config
