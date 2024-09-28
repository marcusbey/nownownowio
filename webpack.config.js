const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production', // Enables optimizations like minification
  entry: './now-widget/index.ts',
  output: {
    filename: 'now-bundle.[contenthash].js',
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
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 244000, // 244 KiB
    maxEntrypointSize: 244000,
  },
  devtool: 'source-map', // Generates source maps for debugging
};