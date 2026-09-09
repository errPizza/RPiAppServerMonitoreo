import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function MiniChart({ data, color = colors.blue, height = 78, labels }: { data: number[]; color?: string; height?: number; labels?: [string, string] }) { const max = Math.max(...data, 1); return <View><View style={[styles.chart, { height }]}>{data.map((value, index) => <View key={index} style={[styles.bar, { height: `${Math.max(8, (value / max) * 100)}%`, backgroundColor: color, opacity: 0.42 + (index / data.length) * 0.58 }]} />)}</View>{labels ? <View style={styles.labels}><Text style={styles.label}>{labels[0]}</Text><Text style={styles.label}>{labels[1]}</Text></View> : null}</View>; }
const styles = StyleSheet.create({ chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 1 }, bar: { flex: 1, borderRadius: 2 }, labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, label: { color: colors.muted, fontSize: 10 } });
