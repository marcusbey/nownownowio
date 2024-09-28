const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production', // Enables optimizations like minification
  entry: './now-widget/index.ts',
  output: {
    filename: 'now-bundle.js',
    path: path.resolve(__dirname, 'public/widget'),
    library: 'NowNowNowWidget',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Handles TypeScript files
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Speeds up compilation
            compilerOptions: {
              jsx: 'react',
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // Handles CSS files with Tailwind
        use: [
          'style-loader', // Injects CSS into the DOM
          'css-loader',
          'postcss-loader', // Processes CSS with PostCSS and Tailwind
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/email': path.resolve(__dirname, './emails'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NEXT_PUBLIC_WIDGET_URL': JSON.stringify(process.env.NEXT_PUBLIC_WIDGET_URL),
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_URL),
    }),
    // Removed MiniCssExtractPlugin
  ],
  optimization: {
    minimizer: [new TerserPlugin()], // Minifies JavaScript
    // Disable code splitting to prevent multiple chunks
    splitChunks: false,
  },
  devtool: 'source-map', // Generates source maps for debugging
};