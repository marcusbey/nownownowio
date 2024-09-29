 // Start of Selection
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production', // Enables optimizations like minification
  entry: {
    'now-bundle': './now-widget/index.ts', // Changed entry point name
  },
  output: {
    filename: 'now-bundle.js',
    path: path.resolve(__dirname, 'public/widget'),
    library: 'NowNowNowWidget',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true, // Cleans the output directory before emit
    // Ensure no code splitting by disabling chunking
    chunkFilename: 'now-bundle-[name].js',
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
        test: /\.css$/, // Handles CSS files
        use: [
          'style-loader', // Injects CSS into the DOM
          'css-loader',
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
    new webpack.ProgressPlugin(),
    {
      apply: (compiler) => {
        compiler.hooks.done.tap('DonePlugin', (stats) => {
          console.log('✅ Build complete!');
        });
      },
    },
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    minimize: true, // Enable minimization
    minimizer: [
      new TerserPlugin({
        parallel: true, // Use multi-process parallel running to improve the build speed
        terserOptions: {
          compress: {
            drop_console: true, // Removes console logs
          },
        },
      }),
      new CssMinimizerPlugin(), // Minify CSS
    ],
    splitChunks:false,
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 244000, // 244 KiB
    maxEntrypointSize: 244000,
  },
  devtool: 'source-map', // Generates source maps for debugging
};