import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // 이름을 userProfile로 변경
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 프로필 로드 함수
  const fetchProfile = async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single(); // .single()을 써서 객체 하나만 가져옵니다.
      
      if (error) throw error;
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error("❌ 프로필 로드 실패:", err.message);
    } finally {
      setLoading(false); // 프로필까지 로드 완료되어야 로딩 끝
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("로그아웃 오류:", error.message);
    }
  };

  const resendConfirmationEmail = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("🚨 세션 확인 중 에러:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const value = {
    user,
    userProfile, // App.jsx와 이름 통일
    isAdmin: userProfile?.role?.toUpperCase() === "ADMIN",
    isAuthenticated,
    loading, // loading 상태도 공유
    signUp,
    signIn,
    signOut, 
    resendConfirmationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}