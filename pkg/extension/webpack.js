/* Credit: https://github.com/paulmwatson/web-ext-environments.git */
const CopyPlugin = require('copy-webpack-plugin')
const DotenvPlugin = require('dotenv-webpack')
const replaceWithProcessEnv = require('./replace-with-process-env.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')

const env = process.env.EXT_ENV || 'local'

module.exports = () => {
  const dotenvPath = __dirname + '/.env.' + env
  const envVars = require('dotenv').config({ path: dotenvPath }).parsed
  return {
    entry: path.resolve(__dirname, 'src') + '/scripts/background.js',
    mode: process.env.EXT_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.EXT_ENV === 'production' ? undefined : 'source-map',
    output: {
      filename: 'scripts/background.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new CleanWebpackPlugin(),
      new DotenvPlugin({
        path: dotenvPath,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            transform(content) {
              return replaceWithProcessEnv(content.toString(), envVars)
            },
          },
          { from: 'src/images', to: 'images' },
          { from: 'src/scripts', to: 'scripts' },
          { from: 'src/views', to: 'views' },
          { from: 'src/_locales', to: '_locales' },
        ],
      }),
    ],
  }
}
