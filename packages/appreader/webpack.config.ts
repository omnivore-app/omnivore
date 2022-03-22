import path from "path"
import glob from 'glob'
import { DefinePlugin } from 'webpack'
import { Configuration } from "webpack"
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'


const analyze = process.env.ANALYZE

const config: Configuration = {
  entry: {
    bundle: './src/index.tsx',
    fonts: [
      ...glob.sync('../web/public/static/fonts/Inter/*'),
      ...glob.sync('../web/public/static/fonts/SFMono/*')
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", {"runtime": "automatic"}],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', {
          loader: 'css-loader',
          options: { url: false }
        }, {
          // We want paths like `/static/fonts/Inter/Inter.woff2 to become
          // `Inter.woff2` which is how they will be bundled on iOS.
          loader: 'string-replace-loader',
          options: {
            search: '\(\'/static/fonts/.*/(.*)\'\)',
            replace(_s: string, _p: string, group: string) {
              return group
            },
            flags: 'g',
          },
        }],
      },
      {
        test: /.(ttf|otf|woff(2)?)(\?[a-z0-9]+)?$/,
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]'
        }
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
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: '[name].js',
  },
};

export default config;