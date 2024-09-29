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
    filename: '[name].js', // This will create now-bundle.js for the main entry
    chunkFilename: 'chunks/[name].[contenthash].js', // Unique names for other chunks
    path: path.resolve(__dirname, 'public/widget'),
    library: 'NowNowNowWidget',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true, // Cleans the output directory before emit
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
    // Uncomment the next line if you plan to analyze your bundle
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
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Extract the package name from the path
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            // Replace scope (@) if present and prefix with 'npm.'
            return `vendor.${packageName.replace('@', '')}`;
          },
          enforce: true,
          priority: 10, // Higher priority to ensure this group is selected first
        },
        commons: {
          test: /[\\/]src[\\/]/,
          name(module) {
            const moduleName = module.identifier().split('/').slice(-3, -1).join('/');
            return `commons.${moduleName}`;
          },
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
        // Additional cache groups can be added here
      },
    },
    runtimeChunk: 'single', // Creates a runtime file to be shared for all generated chunks
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 244000, // 244 KiB
    maxEntrypointSize: 244000,
  },
  devtool: 'source-map', // Generates source maps for debugging
};