import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swiftsell.ai',
  appName: 'SwiftSell AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
