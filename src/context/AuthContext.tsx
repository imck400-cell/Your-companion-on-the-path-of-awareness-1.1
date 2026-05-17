import React, { createContext, useContext, useEffect, useState } from 'react';
import { localDb, generateId, getFromStorage, saveToStorage } from '@/lib/localDb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, AlertCircle } from 'lucide-react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

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

  // Local login form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const savedUser = getFromStorage('local_user');
    if (savedUser) {
      setUser(savedUser);
      let p = localDb.getDoc('users', savedUser.uid);
      if (!p) {
        p = {
          uid: savedUser.uid,
          email: savedUser.email,
          displayName: savedUser.displayName,
          photoURL: savedUser.photoURL,
          role: savedUser.email === 'imck400@gmail.com' ? 'super_admin' : 'user',
          permissions: savedUser.email === 'imck400@gmail.com' ? ['all'] : [],
          expiryDate: null,
          createdAt: new Date().toISOString()
        };
        localDb.setDoc('users', savedUser.uid, p);
      }
      setProfile(p);
    }
    setLoading(false);
  }, []);

  const login = async () => {
    setLoginError(null);
    setShowLoginModal(true);
  };

  const handleLocalLogin = async () => {
    if (!email || !name) {
      setLoginError('يرجى إدخال الاسم والبريد الإلكتروني');
      return;
    }
    setIsAuthenticating(true);
    
    setTimeout(() => {
      const newUser: User = {
        uid: generateId(),
        email: email,
        displayName: name,
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name,
      };
      
      setUser(newUser);
      saveToStorage('local_user', newUser);
      
      const newProfile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
        role: newUser.email === 'imck400@gmail.com' || newUser.email.includes('admin') ? 'super_admin' : 'user',
        permissions: ['all'],
        expiryDate: null,
        createdAt: new Date().toISOString()
      };
      localDb.setDoc('users', newUser.uid, newProfile);
      setProfile(newProfile);
      
      setIsAuthenticating(false);
      setShowLoginModal(false);
    }, 500);
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('local_user');
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
            <DialogTitle className="text-2xl text-center font-bold text-primary">تسجيل الدخول المحلي</DialogTitle>
            <DialogDescription className="text-center text-base">
              هذه النسخة محلية ولا تتصل بأي خادم. يرجى إدخال أي اسم وبريد إلكتروني للدخول.
              جرب بريد 'admin' للحصول على صلاحيات المدير.
            </DialogDescription>
          </DialogHeader>

          {loginError && (
            <div className="bg-destructive/15 text-destructive p-4 rounded-xl flex items-start gap-3 mt-4 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{loginError}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-8">
            <Input 
              placeholder="الاسم" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input 
              placeholder="البريد الإلكتروني" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Button 
              onClick={handleLocalLogin} 
              disabled={isAuthenticating}
              className="w-full h-14 text-base font-bold rounded-2xl shadow-lg mt-2 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              {isAuthenticating ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'تسجيل الدخول'
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
