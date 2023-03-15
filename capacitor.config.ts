import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'home.kit',
  appName: 'home-kit',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
      'android-targetSdkVersion': '28'
    }
  }
};

export default config;
