const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };
  
  // Ensure proper JSX handling
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
        plugins: [
          'react-native-reanimated/plugin',
        ],
      },
    },
  });
  
  // Use custom HTML template with Ionicons CDN
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: 'web/index.html',
      inject: true,
    })
  );
  
  return config;
};
