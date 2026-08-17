import { View, Text, SafeAreaView, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext';
import { CaseStatusChart } from '../components/CaseStatusChart';
import { palette, spacing, radius } from '../theme';
import { t } from '../i18n';

const compliments = [
  "You're making a difference every day ✨",
  "Your work matters – keep going! 💪",
  "Today is a new opportunity to serve 🌟",
  "Every case resolved is a step forward 🚀",
  "You've got this! 🌈",
];

export function DashboardScreen() {
  const { user, dashboard, signOut, uiLang } = useAuth();

  if (!user || !dashboard) return null;

  const firstName = user.name.split(' ')[0];
  const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
  const { total, active, resolved } = dashboard.metrics;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.greetingContainer}>
          <View>
            <Text style={styles.greeting}>Good morning, {firstName} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <Pressable onPress={signOut} style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={22} color={palette.muted} />
          </Pressable>
        </Animated.View>

        {/* Compliment */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.complimentCard}>
          <LinearGradient
            colors={['rgba(69,214,161,0.12)', 'rgba(69,214,161,0.03)']}
            style={styles.complimentGradient}
          />
          <Ionicons name="sparkles" size={24} color={palette.primary} />
          <Text style={styles.complimentText}>{randomCompliment}</Text>
        </Animated.View>

        {/* Metrics */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{total}</Text>
            <Text style={styles.metricLabel}>Total Cases</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: '#60a5fa' }]}>{active}</Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: '#34d399' }]}>{resolved}</Text>
            <Text style={styles.metricLabel}>Resolved</Text>
          </View>
        </Animated.View>

        {/* Chart */}
        <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <CaseStatusChart />
        </Animated.View>

        {/* Quick Action */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <Pressable style={styles.actionBtn} onPress={() => {}}>
            <LinearGradient
              colors={['#45d6a1', '#2fb888']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionText}>View All Cases</Text>
              <Ionicons name="arrow-forward" size={20} color={palette.ink} />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// 🟢 FULLY CORRECTED STYLES
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e1e1e',
  },
  date: {
    fontSize: 14,
    color: palette.muted,
    marginTop: 4,
  },
  signOutBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  complimentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(69,214,161,0.05)',
  },
  complimentGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  complimentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e1e1e',
    marginLeft: 12,
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 24,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.ink,
  },
  metricLabel: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 4,
  },
  actionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  actionGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
    marginRight: 8,
  },
});