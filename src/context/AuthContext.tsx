import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { subscribeUserExtraHours } from '../services/extraHoursService';
import { subscribeUserSettings } from '../services/settingsService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType>({ firebaseUser: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setRecords = useExtraHoursStore((state) => state.setRecords);
  const setSettings = useExtraHoursStore((state) => state.setSettings);
  const setIsLoading = useExtraHoursStore((state) => state.setIsLoading);

  const [fbUser, setFbUser] = React.useState<FirebaseUser | null>(null);

  useEffect(() => {
    let unsubscribeHours: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
          photoURL: user.photoURL,
        });

        // Realtime subscriptions for extra hours and settings
        setIsLoading(true);
        unsubscribeHours = subscribeUserExtraHours(user.uid, (records) => {
          setRecords(records);
          setIsLoading(false);
        });

        unsubscribeSettings = subscribeUserSettings(user.uid, (settings) => {
          setSettings(settings);
        });
      } else {
        setUser(null);
        setRecords([]);
        if (unsubscribeHours) unsubscribeHours();
        if (unsubscribeSettings) unsubscribeSettings();
        setIsLoading(false);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubscribeHours) unsubscribeHours();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [setUser, setLoading, setRecords, setSettings, setIsLoading]);

  return <AuthContext.Provider value={{ firebaseUser: fbUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
