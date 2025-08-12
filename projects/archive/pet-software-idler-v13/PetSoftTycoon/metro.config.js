const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for Legend State
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require'
];

// Add Legend State module mapping from validation report
config.resolver.moduleMap = {
  '@legendapp/state': '@legendapp/state/dist/index.js',
};

module.exports = config;