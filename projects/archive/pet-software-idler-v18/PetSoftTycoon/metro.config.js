const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports
config.resolver.unstable_enablePackageExports = true;

// Configure for React Native new architecture
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Ensure proper handling of source maps
config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;