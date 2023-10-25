import path from 'path'
import { DefinePlugin } from 'webpack'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const analyze = process.env.ANALYZE

const config: Configuration = {
  entry: {
    bundle: './src/index.jsx',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false },
          },
          {
            // We want paths like `/static/fonts/Inter/Inter.woff2 to become
            // `Inter.woff2` which is how they will be bundled on iOS.
            loader: 'string-replace-loader',
            options: {
              search: "('/static/fonts/.*/(.*)')",
              replace(_s: string, _p: string, group: string) {
                return group
              },
              flags: 'g',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env': 'window.omnivoreEnv',
    }),
    new BundleAnalyzerPlugin({
      openAnalyzer: !!analyze,
      analyzerMode: 'static',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      stream: false,
      fs: false,
      zlib: false,
    }
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
}

export default config
