import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, signupUser } from "@/lib/api";

const AUTH_TOKEN_KEY = "syncsphere-token";
const AUTH_USER_KEY = "syncsphere-user";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  loginVideoVisible: false,
  triggerLoginVideo: () => {},
  clearLoginVideo: () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginVideoVisible, setLoginVideoVisible] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persistAuth = (token, userData) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    setLoginVideoVisible(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const triggerLoginVideo = () => setLoginVideoVisible(true);
  const clearLoginVideo = () => setLoginVideoVisible(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        const userData = response.user || response;
        persistAuth(token, userData);
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });
    persistAuth(data.token, data.user);
    setLoginVideoVisible(true);
    return data;
  };

  const signup = async ({ name, email, password, confirmPassword }) => {
    const data = await signupUser({ name, email, password, confirmPassword });
    return data;
  };

  const logout = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      // Ignore logout errors and still clear local auth state.
    }

    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        loginVideoVisible,
        triggerLoginVideo,
        clearLoginVideo,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
