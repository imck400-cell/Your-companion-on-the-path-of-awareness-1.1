import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Languages, User, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, profile, login, logout, isAdmin } = useAuth();

  const themes: any[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'nature', label: 'Nature' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'high-contrast', label: 'High Contrast' }
  ];

  const languages = [
    { id: 'ar', label: 'العربية' },
    { id: 'en', label: 'English' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-primary">رفيقك في طريق الوعي</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} nativeButton={false}>
              <Languages className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang.id} onClick={() => setLanguage(lang.id)}>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} nativeButton={false}>
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {themes.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth / Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />} nativeButton={false}>
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="h-8 w-8 rounded-full" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem render={<Link to="/admin" className="flex items-center gap-2 cursor-pointer" />} nativeButton={false}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t('admin_panel')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={login} variant="default" size="sm">
              {t('login')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
