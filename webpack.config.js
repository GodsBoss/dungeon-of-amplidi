var HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  "mode": "production",
  "entry": "./src/init.js",
  plugins: [
    new HtmlWebpackPlugin(
      {
        "title": "Dungeon of Amplidi"
      }
    )
  ]
}

module.exports = config
