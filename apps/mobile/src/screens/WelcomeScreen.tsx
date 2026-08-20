import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { PressableScale, Card } from '../components';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '../theme';
import { t } from '../i18n';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { uiLang } = useAuth();
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={{ flex: 1, justifyContent: 'center' }}>
        <Card title={t(uiLang, 'welcomeTitle')} subtitle={t(uiLang, 'welcomeBody')}>
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <PressableScale
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Login', { staff: false })}
              scaleTo={0.97}
            >
              <Ionicons name="person-outline" size={20} color={palette.onPrimary} />
              <Text style={styles.primaryBtnText}>{t(uiLang, 'customerSignIn')}</Text>
            </PressableScale>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <PressableScale
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login', { staff: true })}
              scaleTo={0.97}
            >
              <Ionicons name="briefcase-outline" size={20} color={palette.primary} />
              <Text style={styles.secondaryBtnText}>{t(uiLang, 'staffSignIn')}</Text>
            </PressableScale>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <PressableScale style={styles.linkBtn} onPress={() => navigation.navigate('CustomerRegister')} scaleTo={0.96}>
              <Text style={styles.linkText}>{t(uiLang, 'createCustomer')}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </PressableScale>
          </Animated.View>
        </Card>
      </Animated.View>
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: p.bg, paddingHorizontal: 24 },
    primaryBtn: {
      backgroundColor: p.primarySolid,
      borderRadius: 16,
      minHeight: 54,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 6,
    },
    primaryBtnText: { color: p.onPrimary, fontWeight: '700', fontSize: 16 },
    secondaryBtn: {
      borderWidth: 1.5,
      borderColor: p.primary,
      borderRadius: 16,
      minHeight: 54,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
      backgroundColor: p.primarySofter,
    },
    secondaryBtnText: { color: p.primary, fontWeight: '600', fontSize: 16 },
    linkBtn: {
      marginTop: 18,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    linkText: { color: p.primary, fontWeight: '600', fontSize: 15 },
    linkArrow: { color: p.primary, fontSize: 18, marginLeft: 4 },
  });
