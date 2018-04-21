const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  "mode": "production",
  "entry": "./src/js/init.js",

  "output": {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new HtmlWebpackPlugin(
      {
        "title": "Dungeon of Amplidi",
        "template": path.resolve(__dirname, 'src/index.html')
      }
    )
  ]
}

module.exports = config
