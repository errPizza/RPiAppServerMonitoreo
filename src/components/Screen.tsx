import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { useMonitoring } from '../state/MonitoringContext';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { refresh, state } = useMonitoring();
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView edges={['top']} style={styles.safe}>{scroll ? <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={state === 'loading'} onRefresh={() => void refresh()} tintColor={colors.blue} />}>{content}</ScrollView> : content}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, scroll: { paddingBottom: 112 }, content: { padding: spacing.lg, gap: spacing.lg } });
