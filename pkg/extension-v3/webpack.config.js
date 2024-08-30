const path = require('path')
const DotenvPlugin = require('dotenv-webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const env = process.env.EXT_ENV || 'demo'
const dotenvPath = __dirname + '/.env.' + env

module.exports = {
  mode: /* process.env.EXT_ENV === 'production' ? 'production' : */ 'development',
  devtool:
    /* process.env.EXT_ENV === 'production' ? undefined : */ 'source-map',
  entry: {
    background: './src/background.ts',
    toolbar: './src/scripts/content/toolbar.ts',
    content: './src/scripts/content/content.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DotenvPlugin({
      path: dotenvPath,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/styles.css', to: 'styles.css' },
        { from: 'src/icons', to: 'icons' },
        { from: 'src/images', to: 'images' },
        { from: 'src/views', to: 'views' },
      ],
    }),
  ],
}
