// To improve build performance in dev mode

const path = require('path')
const webpack = require('webpack')
const join = path.join.bind(path, __dirname)
const pkg = require('./package.json')

const OUTPUT_DLL = process.env['OUTPUT_DLL'] || 'dist-dll-dev'

module.exports = {
  mode: 'development',
  entry: {
    dependencies: Object.keys(pkg.dependencies),
  },
  devtool: 'source-map',
  output: {
    filename: `[name].dll.js`,
    library: '[name]',
    path: join(OUTPUT_DLL),
  },
  plugins: [
    new webpack.DllPlugin({
      context: join('src', 'app'),
      name: '[name]',
      path: join(OUTPUT_DLL, `[name].dll.manifest.json`),
    })
  ]
}
