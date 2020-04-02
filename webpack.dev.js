/* eslint-disable */

const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')

const mock = require('./dev/api.json')
const fs = require('fs')

const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    historyApiFallback: true,
    compress: true,
    open: false,
    before: function(app, server, compiler) {
      // app.get('/releases', function(req, res) {
      //   setTimeout(() => {
      //     res.json(mock)
      //   }, 800)
      // })
    },
  },
}

module.exports = merge(common, config)
