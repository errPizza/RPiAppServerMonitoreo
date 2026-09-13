import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import {
  Card,
  MetricCard,
  PageHeader,
  SectionTitle,
  StateView,
  StatusBadge,
} from "../components/Primitives";
import { MiniChart } from "../components/Chart";
import { useMonitoring } from "../state/MonitoringContext";
import { environment } from "../config/environment";
import { colors, spacing } from "../theme";

export function DashboardScreen() {
  const { dashboard, state, error, refresh } = useMonitoring();
  if (!dashboard)
    return (
      <Screen>
        <PageHeader eyebrow="COMMAND CENTER" title="Dashboard" />
        <StateView
          kind={
            state === "loading"
              ? "loading"
              : state === "unauthorized"
                ? "unauthorized"
                : "error"
          }
          message={error}
          onRetry={() => void refresh()}
        />
      </Screen>
    );
  const d = dashboard;
  const diskPercent =
    d.metrics.diskUsed !== null && d.metrics.diskTotal
      ? `${Math.round((d.metrics.diskUsed / d.metrics.diskTotal) * 100)}%`
      : "N/A";
  return (
    <Screen>
      <PageHeader
        eyebrow="COMMAND CENTER"
        title="Dashboard"
        right={<StatusBadge status={environment.bypassAuth || environment.mode === "mock" ? "warning" : d.server.health} label={environment.bypassAuth || environment.mode === "mock" ? "DATOS SIMULADOS" : "SERVER ONLINE"} />}
      />
      <Card style={styles.serverCard}>
        <View>
          <Text style={styles.serverName}>{d.server.name}</Text>
          <Text style={styles.host}>{d.server.host} · Updated just now</Text>
        </View>
        <View style={styles.uptime}>
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text style={styles.uptimeText}>{d.server.uptime}</Text>
        </View>
      </Card>
      <View style={styles.grid}>
        <MetricCard
          icon="speedometer-outline"
          label="CPU"
          value={d.metrics.cpu === null ? "N/A" : `${d.metrics.cpu}%`}
          detail={`${d.metrics.cores.length} cores`}
          color={colors.blue}
        />
        <MetricCard
          icon="hardware-chip-outline"
          label="MEMORY"
          value={`${d.metrics.ramUsed} / ${d.metrics.ramTotal} GB`}
          detail={`${Math.round((d.metrics.ramUsed / d.metrics.ramTotal) * 100)}% used`}
          color={colors.purple}
        />
        <MetricCard
          icon="thermometer-outline"
          label="TEMPERATURE"
          value={
            d.metrics.temperature === null
              ? "N/A"
              : `${d.metrics.temperature}°C`
          }
          detail={
            d.metrics.temperature === null
              ? "Sensor unavailable"
              : "Nominal range"
          }
          color={colors.green}
        />
        <MetricCard
          icon="flash-outline"
          label="POWER"
          value={d.power.watts === null ? "N/A" : `${d.power.watts} W`}
          detail={
            d.power.source === "mock" ? "Mock telemetry" : "Sensor unavailable"
          }
          color={colors.yellow}
        />
        <MetricCard
          icon="save-outline"
          label="STORAGE"
          value={diskPercent}
          detail={
            d.metrics.diskUsed === null
              ? "Collector unavailable"
              : `${(d.metrics.diskTotal! - d.metrics.diskUsed).toFixed(1)} GB free`
          }
          color={colors.orange}
        />
        <MetricCard
          icon="pulse-outline"
          label="REQUESTS"
          value={`${d.requests.perMinute}/min`}
          detail="3.1 req/s"
          color={colors.green}
        />
      </View>
      <SectionTitle title="Service health" />
      <View style={styles.serviceRow}>
        <Card style={styles.service}>
          <View style={styles.serviceHead}>
            <Ionicons name="logo-docker" size={20} color={colors.blue} />
            <StatusBadge status="running" />
          </View>
          <Text style={styles.serviceTitle}>DOCKER</Text>
          <Text style={styles.serviceValue}>
            {d.docker.filter((c) => c.status === "running").length}/
            {d.docker.length} containers running
          </Text>
        </Card>
        <Card style={styles.service}>
          <View style={styles.serviceHead}>
            <Ionicons name="server-outline" size={20} color={colors.green} />
            <StatusBadge status={d.nginx.health} />
          </View>
          <Text style={styles.serviceTitle}>NGINX</Text>
          <Text style={styles.serviceValue}>
            {d.nginx.active} active connections
          </Text>
        </Card>
      </View>
      <SectionTitle title="Traffic · last 20 min" />
      <Card>
        <View style={styles.chartHead}>
          <View>
            <Text style={styles.big}>{d.requests.perMinute}</Text>
            <Text style={styles.host}>requests / minute</Text>
          </View>
          <Text style={styles.green}>↑ 12.4%</Text>
        </View>
        <MiniChart data={d.requests.history} labels={["20 min ago", "Now"]} />
      </Card>
      <SectionTitle title="Recent events" />
      <Card>
        {d.events.map((event, index) => (
          <View
            key={event.id}
            style={[styles.event, index > 0 && styles.divider]}
          >
            <View
              style={[
                styles.eventDot,
                {
                  backgroundColor:
                    event.level === "warning" ? colors.yellow : colors.green,
                },
              ]}
            />
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.host}>{event.detail}</Text>
            </View>
            <Text style={styles.time}>{event.timestamp}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
const styles = StyleSheet.create({
  serverCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serverName: { color: colors.text, fontSize: 19, fontWeight: "800" },
  host: { color: colors.muted, fontSize: 11, marginTop: 4 },
  uptime: { alignItems: "flex-end", gap: 4 },
  uptimeText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  serviceRow: { flexDirection: "row", gap: spacing.sm },
  service: { flex: 1, gap: 7 },
  serviceHead: { flexDirection: "row", justifyContent: "space-between" },
  serviceTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 0.6,
  },
  serviceValue: { color: colors.text, fontSize: 12, lineHeight: 17 },
  chartHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  big: { color: colors.text, fontSize: 25, fontWeight: "800" },
  green: { color: colors.green, fontSize: 12, fontWeight: "700" },
  event: { flexDirection: "row", gap: 10, paddingVertical: 9 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  eventDot: { width: 7, height: 7, borderRadius: 7, marginTop: 4 },
  eventBody: { flex: 1 },
  eventTitle: { color: colors.text, fontSize: 13, fontWeight: "700" },
  time: { color: colors.muted, fontSize: 10 },
});
