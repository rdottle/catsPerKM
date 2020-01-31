const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
var fs = require('fs');

module.exports = {
  //entry point for webpack compiling
  entry : "./src/js/index.js",
  //this will go to the main directory, since I want it to push to github pages
  output: {
    filename: 'main.js',
    path: __dirname
  },
  //mods to load various parts i'm using, namely sass, js, pug
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
       {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.pug$/,
        include: path.join(__dirname, 'src'),
        loaders: [ 'pug-loader' ]
      },
        {
        test: /\.module\.s(a|c)ss$/,
        loader: [ 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              camelCase: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [ 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
            }
          }
        ]
      }
  ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/html/index.pug",
      inject: true
    })
  ]
};

