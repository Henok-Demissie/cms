import { View, Text, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { PressableScale, Card, Field, SelectField, PickerModal } from '../components';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import type { Palette } from '../theme';
import { t } from '../i18n';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export function BusinessRegisterScreen() {
  const navigation = useNavigation<any>();
  const { busy, registerBusiness, uiLang } = useAuth();
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [sector, setSector] = useState('GOVERNMENT');
  const [picker, setPicker] = useState<null | 'sector'>(null);

  const handleSubmit = () => {
    registerBusiness({ firstName, lastName, email, password, businessName, sector });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.innerContainer}>
        <Card title={t(uiLang, 'businessTitle')} subtitle={t(uiLang, 'businessBody')}>
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.row}>
            <View style={styles.half}>
              <Field label={t(uiLang, 'firstName')} value={firstName} onChange={setFirstName} required />
            </View>
            <View style={styles.half}>
              <Field label={t(uiLang, 'lastName')} value={lastName} onChange={setLastName} required />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <Field icon="mail-outline" label={t(uiLang, 'workEmail')} value={email} onChange={setEmail} required />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Field icon="business-outline" label={t(uiLang, 'businessName')} value={businessName} onChange={setBusinessName} required />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <SelectField label={t(uiLang, 'sector')} value={sector} onPress={() => setPicker('sector')} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Field icon="lock-closed-outline" label={t(uiLang, 'passwordLabel')} value={password} onChange={setPassword} secure required />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <PressableScale style={[styles.primaryBtn, busy && styles.btnDisabled]} onPress={handleSubmit} disabled={busy} scaleTo={0.97}>
              {busy ? <ActivityIndicator color={palette.onPrimary} /> : <Text style={styles.primaryBtnText}>{t(uiLang, 'createWorkspace')}</Text>}
            </PressableScale>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <PressableScale style={styles.linkBtn} onPress={() => navigation.navigate('Login', { staff: true })} scaleTo={0.96}>
              <Text style={styles.linkText}>{t(uiLang, 'alreadyRegistered')}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </PressableScale>
          </Animated.View>
        </Card>

        <PickerModal
          visible={picker === 'sector'}
          options={['GOVERNMENT', 'HEALTHCARE', 'BANKING', 'RETAIL', 'HOSPITALITY', 'TELECOM', 'RESTAURANT', 'MANUFACTURING'].map((value) => ({
            label: value,
            value,
          }))}
          onClose={() => setPicker(null)}
          onSelect={setSector}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: p.bg },
    innerContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
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
    btnDisabled: { opacity: 0.6 },
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