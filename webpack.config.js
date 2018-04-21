const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  "mode": "production",
  "entry": "./src/js/init.js",

  "output": {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: ["node_modules"],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              require('@babel/plugin-proposal-export-default-from')
            ]
          }
        }
      }
    ]
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
