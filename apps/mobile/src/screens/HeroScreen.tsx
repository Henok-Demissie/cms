import { View, Text, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { PressableScale } from '../components/PressableScale';
import { spacing, radius, type Palette } from '../theme';
import { t } from '../i18n';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

export function HeroScreen() {
  const navigation = useNavigation<any>();
  const { uiLang, setUiLang } = useAuth();
  const { palette, mode, toggle } = useTheme();
  const styles = useThemedStyles(makeStyles);

  // Floating animation for the logo
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Animated gradient background */}
      <LinearGradient
        colors={palette.gradient}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative gradient overlay */}
      <LinearGradient
        colors={['transparent', palette.glow, 'transparent']}
        style={[styles.glowOverlay, { top: -100, left: -100, width: width + 200, height: height / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Theme + language toggles. Kept outside the centered hero stack so the
          pills sit near the top edge instead of being pushed down with it. */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={styles.topBar}
      >
        <PressableScale
          style={styles.togglePill}
          onPress={toggle}
          scaleTo={0.93}
          accessibilityRole="button"
          accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <View style={styles.toggleChip}>
            <Ionicons
              name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={palette.primary}
            />
          </View>
        </PressableScale>

        <View style={styles.togglePill}>
          <PressableScale
            style={[styles.langChip, uiLang === 'AM' && styles.langChipActive]}
            onPress={() => setUiLang('AM')}
            scaleTo={0.93}
          >
            <Text style={[styles.langChipText, uiLang === 'AM' && styles.langChipTextActive]}>አማ</Text>
          </PressableScale>
          <PressableScale
            style={[styles.langChip, uiLang === 'EN' && styles.langChipActive]}
            onPress={() => setUiLang('EN')}
            scaleTo={0.93}
          >
            <Text style={[styles.langChipText, uiLang === 'EN' && styles.langChipTextActive]}>EN</Text>
          </PressableScale>
        </View>
      </Animated.View>

      <Animated.View
        key="hero"
        entering={FadeIn.duration(800).delay(200)}
        style={styles.hero}
      >
        {/* Animated Logo with float effect */}
        <Animated.View
          entering={ZoomIn.duration(1000).delay(400)}
          style={[styles.logoContainer, floatingStyle]}
        >
          <LinearGradient
            colors={[palette.primarySoft, palette.glow]}
            style={styles.logoGlow}
          />
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={40} color={palette.primary} />
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Animated.Text
          entering={FadeInUp.duration(800).delay(500)}
          style={styles.kicker}
        >
          {t(uiLang, 'brand')}
        </Animated.Text>

        {/* Main Title */}
        <Animated.Text
          entering={FadeInUp.duration(800).delay(600)}
          style={styles.heroTitle}
        >
          {t(uiLang, 'heroTitle')}
        </Animated.Text>

        {/* Subtitle Pill */}
        <Animated.View
          entering={FadeInUp.duration(800).delay(700)}
          style={styles.heroPill}
        >
          <Ionicons name="star" size={14} color={palette.primary} style={styles.pillIcon} />
          <Text style={styles.heroPillText}>{t(uiLang, 'heroSubtitle')}</Text>
        </Animated.View>

        {/* Body Text */}
        <Animated.Text
          entering={FadeInUp.duration(800).delay(800)}
          style={styles.body}
        >
          {t(uiLang, 'heroBody')}
        </Animated.Text>

        {/* Features row */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(900)}
          style={styles.featuresRow}
        >
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={palette.primary} />
            <Text style={styles.featureText}>Secure & Trusted</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="time" size={20} color={palette.primary} />
            <Text style={styles.featureText}>24/7 Support</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={20} color={palette.primary} />
            <Text style={styles.featureText}>100+ Clients</Text>
          </View>
        </Animated.View>

        {/* Primary CTA Button */}
        <Animated.View entering={FadeInUp.duration(600).delay(1000)}>
          <PressableScale
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Welcome')}
            scaleTo={0.97}
          >
            <LinearGradient
              colors={palette.primaryFill}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>{t(uiLang, 'getStarted')}</Text>
              <Ionicons name="arrow-forward" size={20} color={palette.onPrimary} />
            </LinearGradient>
          </PressableScale>
        </Animated.View>

        {/* Secondary Link */}
        <Animated.View entering={FadeInUp.duration(600).delay(1100)}>
          <PressableScale
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Login')}
            scaleTo={0.96}
          >
            <Text style={styles.linkText}>{t(uiLang, 'haveAccount')}</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.primary} />
          </PressableScale>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: p.bg },
    hero: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: 48,
      paddingTop: 0,
    },
    glowOverlay: {
      position: 'absolute',
      borderRadius: 500,
      opacity: 0.3,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      gap: 8,
      paddingHorizontal: spacing.lg,
      paddingTop: 8,
    },
    togglePill: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: p.surfaceRaised,
      padding: 4,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: p.border,
    },
    toggleChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: p.primarySoft,
    },
    langChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: 'transparent',
    },
    langChipActive: {
      backgroundColor: p.primarySoft,
    },
    langChipText: {
      color: p.muted,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    langChipTextActive: {
      color: p.primary,
      fontWeight: '700',
    },
    logoContainer: {
      alignSelf: 'center',
      marginBottom: 4,
    },
    logoGlow: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      alignSelf: 'center',
      top: -30,
    },
    logoBadge: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: p.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: p.primaryBorder,
      shadowColor: p.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    kicker: {
      color: p.primary,
      letterSpacing: 3,
      fontWeight: '700',
      fontSize: 14,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    heroTitle: {
      color: p.text,
      fontSize: 38,
      lineHeight: 46,
      fontWeight: '800',
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    heroPill: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: p.primarySofter,
      borderColor: p.primaryBorderSoft,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    pillIcon: {
      marginRight: 4,
    },
    heroPillText: {
      color: p.primary,
      fontWeight: '600',
      fontSize: 13,
      letterSpacing: 0.3,
    },
    body: {
      color: p.muted,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    featuresRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      flexWrap: 'wrap',
      marginVertical: 4,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: p.surfaceRaised,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: p.border,
    },
    featureText: {
      color: p.text,
      fontSize: 12,
      fontWeight: '500',
    },
    primaryBtn: {
      borderRadius: radius.md,
      overflow: 'hidden',
      marginTop: 6,
    },
    btnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    primaryBtnText: {
      color: p.onPrimary,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    linkBtn: {
      marginTop: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    linkText: {
      color: p.primary,
      fontWeight: '600',
      fontSize: 15,
    },
  });
