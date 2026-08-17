import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { fetchDashboard, login, registerBusiness, registerCustomer } from '../api';
import { t, Lang } from '../i18n';
import type { Dashboard, User } from '../api';

type AuthContextType = {
  user: User | null;
  dashboard: Dashboard | null;
  staff: boolean;
  busy: boolean;
  uiLang: Lang;
  signIn: (email: string, password: string, isStaff: boolean) => Promise<void>;
  signOut: () => void;
  setUiLang: (lang: Lang) => void;
  registerCustomer: (data: any) => Promise<void>;
  registerBusiness: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, initialLang = 'AM' }: { children: ReactNode; initialLang?: Lang }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [staff, setStaff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uiLang, setUiLang] = useState<Lang>(initialLang);

  const signIn = useCallback(
    async (email: string, password: string, isStaff: boolean) => {
      if (!email.trim() || password.length < 6) {
        Alert.alert(t(uiLang, 'signInFailed'), 'Enter your email/phone and password (min 6 characters).');
        return;
      }

      setBusy(true);
      try {
        const result = await login(email.trim(), password);
        const isStaffRole = result.user.role !== 'CUSTOMER';
        if (staff !== isStaffRole) {
          throw new Error(staff ? 'Use customer sign in for this account' : 'Use staff sign in for this account');
        }
        const data = await fetchDashboard(result.token);
        setUser(result.user);
        setDashboard(data);
      } catch (error) {
        Alert.alert(t(uiLang, 'signInFailed'), error instanceof Error ? error.message : 'Try again');
      } finally {
        setBusy(false);
      }
    },
    [uiLang, staff]
  );

  const signOut = useCallback(() => {
    setUser(null);
    setDashboard(null);
  }, []);

  const handleCustomerRegister = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      phone: string;
      gender: string;
      language: Lang;
      email: string;
      nationalId: string;
      password: string;
      confirmPassword: string;
    }) => {
      if (data.password.length < 6) {
        Alert.alert(t(uiLang, 'registrationFailed'), 'Password must be at least 6 characters.');
        return;
      }
      if (data.password !== data.confirmPassword) {
        Alert.alert(t(uiLang, 'registrationFailed'), 'Passwords do not match');
        return;
      }
      setBusy(true);
      try {
        await registerCustomer(data);
        Alert.alert(t(uiLang, 'accountCreated'), t(uiLang, 'signInNow'));
        setStaff(false);
      } catch (error) {
        Alert.alert(t(uiLang, 'registrationFailed'), error instanceof Error ? error.message : 'Try again');
      } finally {
        setBusy(false);
      }
    },
    [uiLang]
  );

  const handleBusinessRegister = useCallback(
    async (data: { firstName: string; lastName: string; email: string; password: string; businessName: string; sector: string }) => {
      setBusy(true);
      try {
        await registerBusiness({
          name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
          email: data.email.trim(),
          password: data.password,
          businessName: data.businessName.trim(),
          sector: data.sector,
        });
        Alert.alert(t(uiLang, 'accountCreated'), t(uiLang, 'signInNow'));
        setStaff(true);
      } catch (error) {
        Alert.alert(t(uiLang, 'registrationFailed'), error instanceof Error ? error.message : 'Try again');
      } finally {
        setBusy(false);
      }
    },
    [uiLang]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        dashboard,
        staff,
        busy,
        uiLang,
        signIn,
        signOut,
        setUiLang,
        registerCustomer: handleCustomerRegister,
        registerBusiness: handleBusinessRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};