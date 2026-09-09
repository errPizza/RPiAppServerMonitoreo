import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { MonitoringProvider } from './src/state/MonitoringContext';
import { colors } from './src/theme';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HardwareScreen } from './src/screens/HardwareScreen';
import { TrafficScreen } from './src/screens/TrafficScreen';
import { LogsScreen } from './src/screens/LogsScreen';
import { AlertsScreen, DockerScreen, ErrorsScreen, NginxScreen, RemoteControlScreen, StatisticsScreen } from './src/screens/SecondaryScreens';
import { MoreScreen, SettingsScreen } from './src/screens/MoreScreen';
const Tabs = createBottomTabNavigator(); const Stack = createNativeStackNavigator();
const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = { Dashboard: 'grid-outline', 'Raspberry Pi': 'hardware-chip-outline', Requests: 'pulse-outline', Logs: 'document-text-outline', More: 'ellipsis-horizontal-outline' };
function TabsNavigator() { return <Tabs.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarIcon: ({ color, size }) => <Ionicons name={tabIcons[route.name]} size={size} color={color} /> })}><Tabs.Screen name="Dashboard" component={DashboardScreen} /><Tabs.Screen name="Raspberry Pi" component={HardwareScreen} /><Tabs.Screen name="Requests" component={TrafficScreen} /><Tabs.Screen name="Logs" component={LogsScreen} /><Tabs.Screen name="More" component={MoreScreen} /></Tabs.Navigator>; }
export default function App() { return <MonitoringProvider><NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, primary: colors.blue, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border, notification: colors.red } }}><StatusBar style="light" /><Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerShadowVisible: false, headerTitleStyle: { fontWeight: '700' } }}><Stack.Screen name="Command Center" component={TabsNavigator} options={{ headerShown: false }} /><Stack.Screen name="Errors" component={ErrorsScreen} /><Stack.Screen name="Docker" component={DockerScreen} /><Stack.Screen name="Nginx" component={NginxScreen} /><Stack.Screen name="Statistics" component={StatisticsScreen} /><Stack.Screen name="Alerts" component={AlertsScreen} /><Stack.Screen name="Remote Control" component={RemoteControlScreen} /><Stack.Screen name="Settings" component={SettingsScreen} /></Stack.Navigator></NavigationContainer></MonitoringProvider>; }
