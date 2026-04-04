import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, getRedirectResult } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, AlertCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect result error:', error);
    });

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            // Create default profile
            const newProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: user.email === 'imck400@gmail.com' ? 'super_admin' : 'user',
              permissions: user.email === 'imck400@gmail.com' ? ['all'] : [],
              expiryDate: null,
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async () => {
    setLoginError(null);
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    // Removed prompt: 'select_account' to avoid immediate closure by some browsers
    
    try {
      await signInWithPopup(auth, provider);
      setShowLoginModal(false); // Only close on success
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setLoginError('تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError('تم حظر النافذة المنبثقة! يرجى السماح بالنوافذ المنبثقة من إعدادات المتصفح.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError('نطاق الموقع غير مصرح به في Firebase. يرجى إضافة رابط الموقع بالكامل (Vercel) في إعدادات تصريح الوصول في Firebase.');
      } else if (error.code === 'auth/network-request-failed') {
        setLoginError('خطأ في الاتصال بالشبكة. يرجى التحقق من الإنترنت والمحاولة.');
      } else {
        setLoginError(`حدث خطأ أثناء الاتصال: ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin, isSuperAdmin }}>
      {children}
      
      <Dialog open={showLoginModal} onOpenChange={(open) => !isAuthenticating && setShowLoginModal(open)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-8 rounded-3xl" dir="rtl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center font-bold text-primary">تسجيل الدخول</DialogTitle>
            <DialogDescription className="text-center text-base">
              مرحباً بك في منصة رفيقك في طريق الوعي. يرجى المتابعة باستخدام حسابك.
            </DialogDescription>
          </DialogHeader>

          {loginError && (
            <div className="bg-destructive/15 text-destructive p-4 rounded-xl flex items-start gap-3 mt-4 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{loginError}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-8">
            <Button 
              onClick={handleGoogleLogin} 
              disabled={isAuthenticating}
              className="w-full h-14 text-base font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              {isAuthenticating ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>المتابعة باستخدام Google</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowLoginModal(false)}
              disabled={isAuthenticating}
              className="w-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
