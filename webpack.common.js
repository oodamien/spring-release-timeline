/* eslint-disable */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const CopyPlugin = require('copy-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'

const config = {
  entry: path.resolve(__dirname, 'src/Index.js'),
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
    filename: 'main-[hash].js',
    chunkFilename: 'chunk-[chunkhash].js',
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[hash].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'static'),
        to: path.resolve(__dirname, 'public'),
      },
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
    }),
  ],
}

module.exports = config
