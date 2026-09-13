import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { MonitoringProvider, useMonitoring } from './src/state/MonitoringContext';
import { environment } from './src/config/environment';
import { colors } from './src/theme';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HardwareScreen } from './src/screens/HardwareScreen';
import { TrafficScreen } from './src/screens/TrafficScreen';
import { LogsScreen } from './src/screens/LogsScreen';
import { AlertsScreen, DockerScreen, ErrorsScreen, NginxScreen, RemoteControlScreen, StatisticsScreen } from './src/screens/SecondaryScreens';
import { SettingsScreen } from './src/screens/MoreScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { IntroScreen } from './src/screens/IntroScreen';

import { AppMenuHeader } from './src/navigation/AppMenuHeader';
import { Fullscreen } from './src/components/Fullscreen';
import { StorageScreen } from './src/screens/StorageScreen';
const Stack = createNativeStackNavigator();
const navigationTheme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: colors.text, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border, notification: colors.red } };

function RootNavigator() {
  const { state } = useAuth();
  if (state !== 'authenticated') return <LoginScreen />;
  return <NavigationContainer theme={navigationTheme}><Stack.Navigator screenOptions={{ header: props => <AppMenuHeader {...props} />, contentStyle: { backgroundColor: colors.bg }, statusBarHidden: true, navigationBarHidden: true, autoHideHomeIndicator: true }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Raspberry Pi" component={HardwareScreen} />
    <Stack.Screen name="Storage" component={StorageScreen} />
    <Stack.Screen name="Requests" component={TrafficScreen} />
    <Stack.Screen name="Logs" component={LogsScreen} />
    <Stack.Screen name="Errors" component={ErrorsScreen} />
    <Stack.Screen name="Docker" component={DockerScreen} />
    <Stack.Screen name="Nginx" component={NginxScreen} />
    <Stack.Screen name="Statistics" component={StatisticsScreen} />
    <Stack.Screen name="Alerts" component={AlertsScreen} />
    <Stack.Screen name="Remote Control" component={RemoteControlScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator></NavigationContainer>;
}

function AppContent() {
  const [introComplete, setIntroComplete] = useState(false);
  const { state, retrySession } = useAuth();
  const monitoring = useMonitoring();
  const [appMounted, setAppMounted] = useState(false);
  const canMount = state !== 'checking' && (state !== 'authenticated' || monitoring.state !== 'loading');
  const startupReady = canMount && appMounted;
  const local = environment.bypassAuth || environment.mode === 'mock';
  const startupLines = [
    state === 'checking' ? 'Cargando sesión…' : environment.bypassAuth ? 'Sesión local lista · bypass activo' : state === 'authenticated' ? 'Sesión cargada' : 'Inicio de sesión necesario',
    ...(state === 'authenticated' ? [monitoring.state === 'loading'
      ? local ? 'Cargando datos locales…' : 'Conectando a RPi Server · cargando datos…'
      : monitoring.state === 'loaded' ? local ? 'Datos locales cargados · sin conexión a RPi' : 'Datos de RPi Server cargados'
      : 'RPi no disponible · abriendo estado de error'] : []),
    ...(canMount ? [appMounted ? 'APP lista' : 'Cargando APP…'] : []),
  ];
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!introComplete) return;
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then(reduced => {
      if (!active) return;
      animation = Animated.timing(opacity, { toValue: 1, duration: reduced ? 120 : 420, useNativeDriver: true });
      animation.start();
    });
    return () => { active = false; animation?.stop(); };
  }, [introComplete, opacity]);
  return <View style={{ flex: 1, backgroundColor: '#000' }}>
    {canMount && <Animated.View
      onLayout={() => setAppMounted(true)}
      pointerEvents={introComplete ? 'auto' : 'none'}
      accessibilityElementsHidden={!introComplete}
      importantForAccessibility={introComplete ? 'auto' : 'no-hide-descendants'}
      style={{ flex: 1, opacity }}><RootNavigator /></Animated.View>}
    {!introComplete && <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
      <IntroScreen ready={startupReady} startupLines={startupLines} onInitialize={retrySession} onFinish={() => setIntroComplete(true)} />
    </View>}
  </View>;
}

export default function App() { return <SafeAreaProvider><StatusBar hidden style="light" /><Fullscreen /><AuthProvider><MonitoringProvider><AppContent /></MonitoringProvider></AuthProvider></SafeAreaProvider>; }
