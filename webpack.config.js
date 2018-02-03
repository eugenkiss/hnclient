const path = require('path')
const exec = require('child_process').execSync
const webpack = require('webpack')

// noinspection JSUnusedLocalSymbols
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const DllReferencePlugin = webpack.DllReferencePlugin
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

const PORT = process.env['PORT'] || '5001'
const OUTPUT_DLL = process.env['OUTPUT_DLL'] || 'dist-dll-dev'
const OUTPUT = process.env['OUTPUT'] || 'dist'

const isBuild = process.env['BUILD'] === 'true'
const isDev = !isBuild

const DATE = new Date().getTime()

const GIT_HASH = exec('git rev-parse --short HEAD').toString().trim()
const GIT_STATUS = exec('test -z "$(git status --porcelain)" || echo "dirty"').toString().trim()

const cfg = {}
cfg.context = root('src')

if (isBuild) {
  cfg.devtool = 'source-map'
} else {
  cfg.devtool = 'cheap-module-eval-source-map'
}

// PITA!!!
const hostName = require('os').hostname().toLowerCase()
const hostNameLocal = `${hostName}.local`
const hostLocal = `${hostNameLocal}:${PORT}`

cfg.entry = {
  main: './app/index'
}

cfg.output = {
  path: root(OUTPUT),
  publicPath: '/',
  filename: isBuild ? 'js/[name].[hash].js' : 'js/[name].js',
  chunkFilename: isBuild ? '[id].[hash].chunk.js' : '[id].chunk.js',
}

cfg.target = 'web'

cfg.resolve = {
  //modules: [root(), 'node_modules'],
  extensions: ['.ts', '.js', '.jsx', '.tsx'],
  // Fix webpack's default behavior to not load packages with jsnext:main module
  // (jsnext:main directs not usually distributable es6 format, but es6 sources)
  mainFields: ['module', 'browser', 'main'],
}

if (isBuild) {
  cfg.resolve.alias = {
    "react": "inferno-compat",
    "react-dom": "inferno-compat",
  }
}

cfg.module = {
  loaders: [
    {
      test: /\.tsx?$/,
      include: root('src', 'app'),
      use: {
        loader: 'awesome-typescript-loader',
        options: {
          useCache: true,
          useBabel: true,
          babelOptions: {
              babelrc: false,
              plugins: [
                ["emotion", {
                  "hoist":  true,
                  "sourceMap": !isBuild,
                  "autoLabel": !isBuild,
                }],
              ]
          },
        }
      },
    },
  ]
}

cfg.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(isBuild ? 'production' : 'dev'), // To enable React's optimizations
      'DEV': JSON.stringify(isDev), // For distinguishing between dev and non-dev mode
      'DATE': JSON.stringify(DATE),
      'GIT_HASH': JSON.stringify(GIT_HASH),
      'GIT_STATUS': JSON.stringify(GIT_STATUS),
    }
  }),
]

cfg.plugins.push(
  new CopyWebpackPlugin([{
    from: root('src/public')
  }]),
  // new BundleAnalyzerPlugin({
  //   analyzerPort: 9999,
  // }),
)

if (isBuild) {
  cfg.plugins.push(
    new webpack.IgnorePlugin(/mobx-react-devtools/),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin(),
  )
} else {
  cfg.plugins.push(
    new HtmlWebpackPlugin({
      template: root('src', 'public', 'template.html'),
      favicon: root('src', 'public', 'favicon.png'),
      inject: 'body',
    }),
    new DllReferencePlugin({
      context: root('src', 'app'),
      manifest: root(OUTPUT_DLL, 'dependencies.dll.manifest.json')
    }),
    new AddAssetHtmlPlugin({
      filepath: root(OUTPUT_DLL, 'dependencies.dll.js'),
      outputPath: 'js/dll',
      publicPath: '/js/dll',
      includeSourcemap: true,
    }),
  )
}

cfg.devServer = {
  contentBase: root('src', 'public'),
  hot: false,
  historyApiFallback: true,
  port: PORT,
  stats: {
    warnings: false,
  },

  // PITA!!!
  public: hostLocal,
  useLocalIp: true,
  host: '0.0.0.0',
  allowedHosts: [
    hostName,
    hostNameLocal,
  ],
}

module.exports = cfg

function root(args) {
  args = Array.prototype.slice.call(arguments, 0)
  return path.join.apply(path, [__dirname].concat(args))
}
