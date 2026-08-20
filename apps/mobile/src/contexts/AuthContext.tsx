import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { fetchDashboard, isAuthError, login, registerBusiness, registerCustomer } from '../api';
import { t, Lang } from '../i18n';
import type { Dashboard, User } from '../api';

type AuthContextType = {
  user: User | null;
  token: string | null;
  dashboard: Dashboard | null;
  staff: boolean;
  busy: boolean;
  uiLang: Lang;
  signIn: (email: string, password: string, isStaff: boolean) => Promise<void>;
  signOut: () => void;
  setUiLang: (lang: Lang) => void;
  refreshDashboard: () => Promise<void>;
  registerCustomer: (data: any) => Promise<void>;
  registerBusiness: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, initialLang = 'AM' }: { children: ReactNode; initialLang?: Lang }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [staff, setStaff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uiLang, setUiLang] = useState<Lang>(initialLang);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setDashboard(null);
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchDashboard(token);
      setDashboard(data);
    } catch (error) {
      // A 401 means the token is no longer good — the password changed, or the
      // account is gone. Swallowing it left the app showing a stale dashboard
      // that could no longer refresh; drop the session and say why.
      if (isAuthError(error)) {
        signOut();
        Alert.alert(t(uiLang, 'signInFailed'), 'Your session ended. Please sign in again.');
        return;
      }
      // ignore other background refresh errors
    }
  }, [token, signOut, uiLang]);

  const signIn = useCallback(
    async (email: string, password: string, isStaff: boolean) => {
      if (!email.trim() || password.length < 6) {
        Alert.alert(t(uiLang, 'signInFailed'), 'Enter your email/phone and password (min 6 characters).');
        return;
      }

      setBusy(true);
      try {
        // Tell the server which portal this is, so a wrong password fails as
        // the account type the user picked instead of falling through to the
        // other table. The role check below is then only a second line.
        const result = await login(email.trim(), password, isStaff ? 'staff' : 'customer');
        const isStaffRole = result.user.role !== 'CUSTOMER';
        if (isStaff !== isStaffRole) {
          throw new Error(isStaff ? 'This is a customer account. Please use Customer Sign In.' : 'This is a staff account. Please use Staff Sign In.');
        }
        const data = await fetchDashboard(result.token);
        setToken(result.token);
        setUser(result.user);
        setStaff(isStaffRole);
        setDashboard(data);
      } catch (error) {
        Alert.alert(t(uiLang, 'signInFailed'), error instanceof Error ? error.message : 'Try again');
      } finally {
        setBusy(false);
      }
    },
    [uiLang]
  );

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
        await registerCustomer(data as any);
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
        token,
        dashboard,
        staff,
        busy,
        uiLang,
        signIn,
        signOut,
        setUiLang,
        refreshDashboard,
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