const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './now-widget/index.ts',
  output: {
    filename: 'nownownow-widget-bundle.js',
    path: path.resolve(__dirname, 'public'),
    library: 'NowNowNowWidget',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NEXT_PUBLIC_WIDGET_URL': JSON.stringify(process.env.NEXT_PUBLIC_WIDGET_URL),
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_URL),
    }),
    new MiniCssExtractPlugin({
      filename: 'nownownow-widget-styles.css',
    }),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  devtool: 'source-map'
};