import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { PressableScale, Card, Field } from '../components';
import type { Palette } from '../theme';
import { t } from '../i18n';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  // useRoute() has no params type here, so `staff` needs naming for TypeScript.
  const route = useRoute<RouteProp<{ Login: { staff?: boolean } }, 'Login'>>();
  const { staff = false } = route.params ?? {};
  const { busy, signIn, uiLang } = useAuth();
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => signIn(email, password, staff);

  return (
    <View style={styles.container}>
      <Card title={staff ? t(uiLang, 'signInStaff') : t(uiLang, 'signInCustomer')} subtitle={t(uiLang, 'signInTitle')}>
        <Field
          icon="mail-outline"
          label={t(uiLang, 'emailOrPhone')}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com / 091..."
        />
        <Field
          icon="lock-closed-outline"
          label={t(uiLang, 'passwordLabel')}
          value={password}
          onChange={setPassword}
          secure
          toggle={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />

        <PressableScale style={[styles.primaryBtn, busy && styles.btnDisabled]} onPress={handleSignIn} disabled={busy} scaleTo={0.97}>
          {busy ? <ActivityIndicator color={palette.onPrimary} /> : <Text style={styles.primaryBtnText}>{t(uiLang, 'signIn')}</Text>}
        </PressableScale>

        {staff ? (
          <PressableScale style={styles.linkBtn} onPress={() => navigation.navigate('BusinessRegister')} scaleTo={0.96}>
            <Text style={styles.linkText}>{t(uiLang, 'registerBusiness')}</Text>
          </PressableScale>
        ) : (
          <PressableScale style={styles.linkBtn} onPress={() => navigation.navigate('CustomerRegister')} scaleTo={0.96}>
            <Text style={styles.linkText}>{t(uiLang, 'createCustomer')}</Text>
          </PressableScale>
        )}

        {/*
          Staff and customer accounts are separate, and the portal is now
          enforced by the server rather than guessed from the password. Someone
          who opened the wrong door needs a way across that is not "go back and
          hope" — replace rather than push so Back still reaches Welcome.
        */}
        <PressableScale
          style={styles.switchBtn}
          onPress={() => navigation.replace('Login', { staff: !staff })}
          scaleTo={0.96}
        >
          <Text style={styles.switchText}>{t(uiLang, staff ? 'switchToCustomer' : 'switchToStaff')}</Text>
        </PressableScale>
      </Card>
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    // No backgroundColor: this screen lets the navigator/App gradient show through.
    container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
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
    primaryBtnText: { color: p.onPrimary, fontWeight: '800', fontSize: 15 },
    btnDisabled: { opacity: 0.6 },
    linkBtn: { marginTop: 18, alignItems: 'center' },
    linkText: { color: p.primary, fontWeight: '600', fontSize: 14 },
    switchBtn: { marginTop: 12, alignItems: 'center' },
    switchText: { color: p.muted, fontWeight: '500', fontSize: 13 },
  });
