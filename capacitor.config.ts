
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5376e84e0970478aa27653b4a9437e5f',
  appName: 'omnia-bot-nexus-hub',
  webDir: 'dist',
  server: {
    url: 'https://5376e84e-0970-478a-a276-53b4a9437e5f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
