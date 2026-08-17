import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { PressableScale, Card, Field } from '../components';
import { palette } from '../theme';
import { t } from '../i18n';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { staff = false } = route.params || {};
  const { busy, signIn, uiLang } = useAuth();

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
          {busy ? <ActivityIndicator color={palette.ink} /> : <Text style={styles.primaryBtnText}>{t(uiLang, 'signIn')}</Text>}
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
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  primaryBtn: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    minHeight: 54,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  primaryBtnText: { color: palette.ink, fontWeight: '800', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  linkBtn: { marginTop: 18, alignItems: 'center' },
  linkText: { color: palette.primary, fontWeight: '600', fontSize: 14 },
});