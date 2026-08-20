import { View, Text, SafeAreaView, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { CaseStatusChart } from '../components/CaseStatusChart';
import type { Palette } from '../theme';

const compliments = [
  "You're making a difference every day ✨",
  "Your voice matters – track your submissions 🌟",
  "Every case resolved is a step forward 🚀",
  "Fast and transparent case management 🌈",
];

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, dashboard, signOut } = useAuth();
  const { palette, mode, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (!user || !dashboard) return null;

  const firstName = user.name.split(' ')[0];
  const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
  const { total, active, resolved } = dashboard.metrics;
  const isCustomer = user.role === 'CUSTOMER';
  const orgName = dashboard.tenant?.name || 'Organization Workspace';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.greetingContainer}>
          <View>
            <Text style={styles.portalTag}>
              {isCustomer ? 'CUSTOMER PORTAL' : `STAFF WORKSPACE • ${orgName.toUpperCase()}`}
            </Text>
            <Text style={styles.greeting}>Welcome, {firstName} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={toggle}
              style={styles.signOutBtn}
              accessibilityRole="button"
              accessibilityLabel={mode === 'dark' ? 'Switch to bright mode' : 'Switch to dark mode'}
            >
              <Ionicons
                name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color={palette.primary}
              />
            </Pressable>
            <Pressable onPress={signOut} style={styles.signOutBtn}>
              <Ionicons name="log-out-outline" size={22} color={palette.muted} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Compliment / Banner */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.complimentCard}>
          <LinearGradient
            colors={[palette.primarySoft, palette.primarySofter]}
            style={styles.complimentGradient}
          />
          <Ionicons name="sparkles" size={24} color={palette.primary} />
          <Text style={styles.complimentText}>
            {isCustomer ? randomCompliment : `Managing cases and feedback for ${orgName}`}
          </Text>
        </Animated.View>

        {/* Metrics Row */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{total}</Text>
            <Text style={styles.metricLabel}>{isCustomer ? 'Total Sent' : 'Total Cases'}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: palette.info }]}>{active}</Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: palette.success }]}>{resolved}</Text>
            <Text style={styles.metricLabel}>Resolved</Text>
          </View>
          {!isCustomer && dashboard.metrics.resolutionRate !== undefined && (
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: palette.primary }]}>{dashboard.metrics.resolutionRate}%</Text>
              <Text style={styles.metricLabel}>Resolved %</Text>
            </View>
          )}
        </Animated.View>

        {/* Secondary Sub-Metrics for Complaints, Suggestions, Feedback */}
        <Animated.View entering={FadeInDown.duration(600).delay(220)} style={styles.subMetricsRow}>
          <Pressable style={styles.subMetricCard} onPress={() => navigation.navigate('Cases')}>
            <Ionicons name="folder-open-outline" size={18} color={palette.primary} />
            <Text style={styles.subMetricCount}>{dashboard.metrics.complaints ?? total}</Text>
            <Text style={styles.subMetricTitle}>Complaints</Text>
          </Pressable>
          <Pressable style={styles.subMetricCard} onPress={() => navigation.navigate('Suggestions')}>
            <Ionicons name="bulb-outline" size={18} color={palette.amber} />
            <Text style={styles.subMetricCount}>{dashboard.metrics.suggestions ?? 0}</Text>
            <Text style={styles.subMetricTitle}>Suggestions</Text>
          </Pressable>
          <Pressable style={styles.subMetricCard} onPress={() => navigation.navigate('Suggestions')}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={palette.violet} />
            <Text style={styles.subMetricCount}>{dashboard.metrics.feedback ?? 0}</Text>
            <Text style={styles.subMetricTitle}>Feedback</Text>
          </Pressable>
        </Animated.View>

        {/* Chart (Staff View) */}
        {!isCustomer && (
          <Animated.View entering={FadeInDown.duration(600).delay(250)}>
            <CaseStatusChart
              newCount={dashboard.metrics.new ?? 0}
              ongoing={dashboard.metrics.ongoing ?? 0}
              resolved={resolved}
              total={total}
            />
          </Animated.View>
        )}

        {/* Recent Submissions / Complaints Section */}
        {dashboard.complaints && dashboard.complaints.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(280)} style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>{isCustomer ? 'My Recent Submissions' : 'Recent Cases'}</Text>
              <Pressable onPress={() => navigation.navigate('Cases')}>
                <Text style={styles.viewAllText}>View all →</Text>
              </Pressable>
            </View>
            {dashboard.complaints.slice(0, 3).map((item) => (
              <Pressable
                key={item.id}
                style={styles.recentCard}
                onPress={() => navigation.navigate('Cases')}
              >
                <View style={styles.recentCardTop}>
                  <Text style={styles.recentCardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.status.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
                <View style={styles.recentCardMeta}>
                  {item.tenant && (
                    <Text style={styles.orgTag}>🏢 {item.tenant.name}</Text>
                  )}
                  {item.messages && item.messages.length > 0 && (
                    <Text style={styles.replyTag}>💬 {item.messages.length} replies</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Quick Action Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Cases')}>
            <LinearGradient
              colors={palette.primaryFill}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionText}>{isCustomer ? 'Submit / Track Cases' : 'Manage All Cases'}</Text>
              <Ionicons name="arrow-forward" size={20} color={palette.onPrimary} />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: p.bg,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 40,
    },
    greetingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: 16,
      marginBottom: 20,
    },
    portalTag: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      color: p.primary,
      marginBottom: 4,
    },
    greeting: {
      fontSize: 22,
      fontWeight: '700',
      color: p.text,
    },
    date: {
      fontSize: 13,
      color: p.muted,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    signOutBtn: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: p.surfaceRaised,
    },
    complimentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 14,
      marginBottom: 18,
      overflow: 'hidden',
      backgroundColor: p.primarySofter,
    },
    complimentGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    complimentText: {
      fontSize: 13,
      fontWeight: '500',
      color: p.text,
      marginLeft: 10,
      flex: 1,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 14,
      backgroundColor: p.bgSoft,
      borderRadius: 16,
      marginBottom: 14,
    },
    metricItem: {
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '700',
      color: p.text,
    },
    metricLabel: {
      fontSize: 11,
      color: p.muted,
      marginTop: 2,
    },
    subMetricsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
    },
    subMetricCard: {
      flex: 1,
      backgroundColor: p.bgSoft,
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: p.border,
    },
    subMetricCount: {
      fontSize: 18,
      fontWeight: '700',
      color: p.text,
      marginTop: 4,
    },
    subMetricTitle: {
      fontSize: 10,
      color: p.muted,
      marginTop: 1,
    },
    recentSection: {
      marginTop: 10,
      marginBottom: 16,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    recentTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: p.text,
    },
    viewAllText: {
      fontSize: 12,
      fontWeight: '600',
      color: p.primary,
    },
    recentCard: {
      backgroundColor: p.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: p.borderSoft,
      shadowColor: p.shadow,
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    recentCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    recentCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: p.text,
      flex: 1,
    },
    statusBadge: {
      backgroundColor: p.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: p.primary,
    },
    recentCardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
    },
    orgTag: {
      fontSize: 11,
      color: p.muted,
      fontWeight: '500',
    },
    replyTag: {
      fontSize: 11,
      color: p.primary,
      fontWeight: '500',
    },
    actionBtn: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 10,
    },
    actionGradient: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    actionText: {
      fontSize: 15,
      fontWeight: '600',
      color: p.onPrimary,
      marginRight: 8,
    },
  });
