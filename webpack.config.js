const {
  resolve
} = require('path')
const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const extractCss = new ExtractTextPlugin('assets/css/[name].css')
const extractHtml = new ExtractTextPlugin('[name].html')
const url = require('url')
const publicPath = ''

module.exports = (options = {}) => {
  const config = {
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src/pages'),
        'vue$': 'vue/dist/vue.common.js'
      },
      modules: [
        resolve('.'),
        'node_modules'
      ],
      extensions: ['.js', '.vue', '/']
    },
    entry: {
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: options.dev ? 'assets/js/[name].js' : 'assets/js/[name].js?[chunkhash]',
      chunkFilename: 'assets/js/chunks/[id].js?[chunkhash]',
      publicPath: publicPath
    },
    module: {
      rules: [{
          test: /\.vue$/,
          use: ['vue-loader']
        },
        {
          test: /\.js$/,
          use: ['babel-loader'],
          exclude: /node_modules/
        },
        {
          test: /\.html$/,
          exclude: /index\.html$/,
          use: [{
            loader: 'html-loader',
            options: {
              minimize: true,
              root: resolve(__dirname, 'src'),
              attrs: ['img:src', 'link:href']
            }
          }]
        },
        {
          test: /index\.html$/,
          use: extractHtml.extract({
            use: [{
              loader: 'html-loader',
              options: {
                minimize: true,
                root: resolve(__dirname, 'src'),
                attrs: ['img:src', 'link:href']
              }
            }]
          })
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /favicon\.png$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]'
            }
          }]
        },
        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }]
        }
      ]
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
      // new HtmlWebpackPlugin({
      //   template: 'src/index.html'
      // }),
      // extractCss,
      extractHtml
    ],

    devServer: {
      host: '127.0.0.1',
      port: 8010,
      proxy: {
        '/api/': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      },
      historyApiFallback: {
        index: url.parse(options.dev ? '/assets/' : publicPath).pathname
      }
    },
    devtool: options.dev ? '#eval-source-map' : '#source-map'
  }


  const pagePath = './src/pages/'
  let entries = glob.sync(pagePath + '*').map(function (entry) {
    return {
      name: entry.substring(pagePath.length),
      path: entry
    }
  })

  entries.forEach(function (entry) {
    console.log(entry.path)
    config.entry[entry.name] = entry.path
  })

  entries = entries.map(function (entry) {
    return entry.name
  })

  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    chunks: entries,
    // common chunks should be refered by more than 2/3 entries
    minChunks: entries.length > 3 ? Math.ceil(entries.length * 2.0 / 3) : entries.length
  }))

  console.log(config)
  return config
}