module.exports = {
  presets: ['module:@react-native/babel-preset', '@babel/preset-typescript'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: [
          '.js',
          '.ts',
          '.jsx',
          '.tsx',
          '.json',
          '.ios.js',
          '.ios.jsx',
          '.android.js',
          '.android.jsx',
        ],
        root: ['.'],
        alias: {
          '@utils': './src/utils',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@assets': './src/assets',
          '@screens': './src/screens',
          '@colors': './src/assets/colors',
          '@components': './src/components',
          '@navigation': './src/navigations',
          '@routes': './src/navigations/routes',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        safe: false,
        path: '.env',
        envName: 'ENV',
        verbose: false,
        blocklist: null,
        allowlist: null,
        moduleName: '@env',
        allowUndefined: true,
      },
    ],
    ['react-native-worklets/plugin', {}, 'react-native-worklets-plugin'],
  ],
};
