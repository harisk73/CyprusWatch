
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for native development
config.resolver.assetExts.push('svg');

module.exports = config;
