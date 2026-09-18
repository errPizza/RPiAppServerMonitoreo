import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export function Fullscreen() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const hide = async () => {
      try {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('#00000000');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (error) { console.warn('Fullscreen navigation unavailable', error); }
    };
    void hide();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void hide(); });
    return () => subscription.remove();
  }, []);
  return null;
}
