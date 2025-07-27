
export default {
  expo: {
    name: "cyprus-emergency-mobile",
    slug: "cyprus-emergency-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cyprus.emergency.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.cyprus.emergency.mobile"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-location",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Cyprus Emergency to use your location for emergency reporting."
        }
      ]
    ],
    platforms: ["ios", "android", "web"]
  }
};
