const path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  "mode": "production",
  "entry": "./src/init.js",

  "output": {
    filename: "main.js",
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new HtmlWebpackPlugin(
      {
        "title": "Dungeon of Amplidi"
      }
    )
  ]
}

module.exports = config
