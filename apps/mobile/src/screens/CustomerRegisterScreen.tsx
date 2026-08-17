import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { PressableScale, Card, Field, SelectField, PickerModal } from '../components';
import { palette } from '../theme';
import { t, Lang } from '../i18n';

type Gender = 'MALE' | 'FEMALE';

export function CustomerRegisterScreen() {
  const navigation = useNavigation<any>();
  const { busy, registerCustomer, uiLang } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [formLang, setFormLang] = useState<Lang>('AM');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [picker, setPicker] = useState<null | 'gender' | 'language'>(null);

  const handleSubmit = () => {
    registerCustomer({
      firstName,
      lastName,
      phone,
      gender,
      language: formLang,
      email,
      nationalId,
      password,
      confirmPassword,
    });
  };

  return (
    <View style={styles.container}>
      <Card title={t(uiLang, 'customerRegister')} subtitle={t(uiLang, 'customerRegisterSub')}>
        <View style={styles.row}>
          <View style={styles.half}>
            <Field label={t(uiLang, 'firstName')} value={firstName} onChange={setFirstName} required />
          </View>
          <View style={styles.half}>
            <Field label={t(uiLang, 'lastName')} value={lastName} onChange={setLastName} required />
          </View>
        </View>

        <Field
          icon="call-outline"
          label={t(uiLang, 'phone')}
          value={phone}
          onChange={setPhone}
          placeholder="0911234567"
          keyboardType="phone-pad"
          required
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <SelectField
              label={t(uiLang, 'gender')}
              value={gender === 'MALE' ? t(uiLang, 'male') : t(uiLang, 'female')}
              onPress={() => setPicker('gender')}
            />
          </View>
          <View style={styles.half}>
            <SelectField
              label={t(uiLang, 'language')}
              value={formLang === 'AM' ? t(uiLang, 'amharic') : t(uiLang, 'english')}
              onPress={() => setPicker('language')}
            />
          </View>
        </View>

        <Field icon="mail-outline" label={t(uiLang, 'emailOptional')} value={email} onChange={setEmail} placeholder="your@email.com" />
        <Field icon="card-outline" label={t(uiLang, 'nationalId')} value={nationalId} onChange={setNationalId} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Field
              icon="lock-closed-outline"
              label={t(uiLang, 'password')}
              value={password}
              onChange={setPassword}
              secure
              toggle={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              required
            />
          </View>
          <View style={styles.half}>
            <Field
              label={t(uiLang, 'confirmPassword')}
              value={confirmPassword}
              onChange={setConfirmPassword}
              secure
              toggle={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              required
            />
          </View>
        </View>

        <PressableScale style={[styles.primaryBtn, busy && styles.btnDisabled]} onPress={handleSubmit} disabled={busy} scaleTo={0.97}>
          {busy ? <ActivityIndicator color={palette.ink} /> : <Text style={styles.primaryBtnText}>{t(uiLang, 'register')}</Text>}
        </PressableScale>

        <PressableScale style={styles.linkBtn} onPress={() => navigation.navigate('Login', { staff: false })} scaleTo={0.96}>
          <Text style={styles.linkText}>{t(uiLang, 'alreadyRegistered')}</Text>
        </PressableScale>
      </Card>

      <PickerModal
        visible={picker === 'gender'}
        options={[
          { label: t(uiLang, 'male'), value: 'MALE' },
          { label: t(uiLang, 'female'), value: 'FEMALE' },
        ]}
        onClose={() => setPicker(null)}
        onSelect={(value) => setGender(value as Gender)}
      />
      <PickerModal
        visible={picker === 'language'}
        options={[
          { label: t(uiLang, 'amharic'), value: 'AM' },
          { label: t(uiLang, 'english'), value: 'EN' },
        ]}
        onClose={() => setPicker(null)}
        onSelect={(value) => setFormLang(value as Lang)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
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