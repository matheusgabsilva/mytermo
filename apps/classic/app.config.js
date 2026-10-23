/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: '5 Letras',
  slug: 'cinco-letras',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  primaryColor: '#2F80ED',
  platforms: ['android', 'ios', 'web'],
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/icon.png',
  },
  assetBundlePatterns: ['**/*'],
  icon: './assets/icon.png',
  plugins: [
    'expo-font',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F6F7F2',
        image: './assets/splash-icon.png',
        imageWidth: 200,
      },
    ],
  ],
  android: {
    package: 'com.calazans.cincoletras',
    versionCode: 1,
    permissions: [],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F6F7F2',
    },
  },
  ios: {
    bundleIdentifier: 'com.calazans.cincoletras',
    buildNumber: '1',
    supportsTablet: true,
  },
  owner: 'skab',
  extra: {
    eas: {
      projectId: '2f308e0b-44f5-4ad0-b25a-2b06f15e9f35',
    },
  },
};
