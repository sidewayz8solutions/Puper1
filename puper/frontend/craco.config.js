/ craco.config.js
// Place this file in your frontend root directory

module.exports = {
  style: {
    css: {
      loaderOptions: (cssLoaderOptions, { env, paths }) => {
        return cssLoaderOptions;
      },
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Disable CSS minimization temporarily
      if (env === 'production') {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
          minimizer => !minimizer.constructor.name.includes('CssMinimizerPlugin')
        );
      }
      return webpackConfig;
    },
  },
};