
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { User, LogOut, Settings, Languages, Sun, Moon } from 'lucide-react'; // Added Sun and Moon icons
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationDot from '@/components/ui/NotificationDot';
import { supabase } from '@/integrations/supabase/client';
import { type PostgrestError } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  // Check if user is a client
  const isClient = currentUser?.role === 'client';

  // Dark mode management
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for unread messages
  useEffect(() => {
    if (!currentUser?.id) {
      setHasUnreadMessages(false); // Ensure it's false if no user
      return;
    }

    // Define the expected shape of a single item in the data array
    type ConversationUnreadInfo = {
      unread_count: number | null;
    };

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('unread_count')
        .contains('participant_ids', [currentUser.id]) 
        .neq('unread_count', 0);

      // Force cast through unknown, as TypeScript's inferred type for 'data' might be incorrect
      const typedData = data as unknown as (ConversationUnreadInfo[] | null);
      const typedError = error as (PostgrestError | null);

      if (!typedError && typedData && typedData.length > 0) {
        // Ensure at least one conversation actually has a positive unread_count
        const anyUnread = typedData.some(conv => conv && conv.unread_count && conv.unread_count > 0);
        setHasUnreadMessages(anyUnread);
      } else {
        setHasUnreadMessages(false);
        if (typedError) {
          console.error('Error fetching unread count for Navbar:', typedError.message);
        }
      }
    };

    fetchUnreadCount();

    const conversationsChannel = supabase
      .channel('public:conversations:navbar-rls-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `participant_ids=cs.{"${currentUser.id}"}` },
        (payload) => {
          fetchUnreadCount();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Navbar: Successfully subscribed to conversations RLS channel.');
        } else if (err) {
          console.error('Navbar: Conversations RLS channel subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [currentUser?.id]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 md:px-8",
        scrolled ? "py-3 bg-white/80 dark:bg-black/50 backdrop-blur-lg shadow-sm" : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/favicon.png"
            alt={t('VideoCut') + " logo"}
            className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
          />
          <span className="text-2xl font-semibold bg-clip-text text-foreground">{t('VideoCut')}</span>
        </Link>

        <div className={cn(
          "hidden md:flex items-center space-x-8",
          !isAuthenticated && "mx-auto" // Center links when not authenticated
        )}>
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/" ? "text-primary" : "text-foreground/80"
            )}
          >
            {t('Home')}
          </Link>
          <Link 
            to="/explore" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/explore" ? "text-primary" : "text-foreground/80"
            )}
          >
            {t('Explore')}
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  location.pathname === "/dashboard" ? "text-primary" : "text-foreground/80"
                )}
              >
                {t('Dashboard')}
                {hasUnreadMessages && (
                  <NotificationDot className="absolute -right-3 -top-1" />
                )}
              </Link>
              {!isClient && (
                <Link 
                  to="/portfolio" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/portfolio" ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {t('MyPortfolio')}
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => changeLanguage('en')} 
                disabled={i18n.language === 'en'}
                className={cn(i18n.language === 'en' && "bg-accent")}
              >
                EN
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeLanguage('fr')} 
                disabled={i18n.language === 'fr'}
                className={cn(i18n.language === 'fr' && "bg-accent")}
              >
                FR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Toggle Dark Mode */}
          <Button variant="ghost" size="icon" onClick={toggleDark} className="text-foreground/80 hover:text-primary">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {hasUnreadMessages && (
                    <NotificationDot className="absolute -right-1 -top-1" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1 mr-1" align="end">
                <DropdownMenuLabel>{t('MyAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer relative flex items-center">
                    {t('Dashboard')}
                    {hasUnreadMessages && (
                      <NotificationDot className="ml-2" />
                    )}
                  </Link>
                </DropdownMenuItem>
                {!isClient && (
                  <DropdownMenuItem asChild>
                    <Link to="/portfolio" className="w-full cursor-pointer">{t('MyPortfolio')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard?tab=account" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('Account')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('Logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="font-medium text-foreground/80 hover:text-primary">
                  {t('Login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('SignUp')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
