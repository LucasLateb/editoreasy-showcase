
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { User, LogOut, Settings } from 'lucide-react';
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

const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  // Check if user is a client
  const isClient = currentUser?.role === 'client';

  // Gestion du dark mode
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
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
    if (!currentUser?.id) return;

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('unread_count')
        .contains('participant_ids', [currentUser.id])
        .neq('unread_count', 0);

      if (!error && data && data.length > 0) {
        setHasUnreadMessages(true);
      } else {
        setHasUnreadMessages(false);
      }
    };

    fetchUnreadCount();

    // Subscribe to changes in conversations table to update notification badge in real-time
    const conversationsChannel = supabase
      .channel('public:conversations:navbar-rls-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `participant_ids=cs.{"${currentUser.id}"}` },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

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
          <span className="text-2xl font-semibold bg-clip-text text-foreground">VideoCut</span>
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
            Home
          </Link>
          <Link 
            to="/explore" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/explore" ? "text-primary" : "text-foreground/80"
            )}
          >
            Explore
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
                Dashboard
                {hasUnreadMessages && (
                  <NotificationDot className="absolute -right-3 -top-1" />
                )}
              </Link>
              {/* Only show Portfolio link for editors (non-client users) */}
              {!isClient && (
                <Link 
                  to="/portfolio" 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/portfolio" ? "text-primary" : "text-foreground/80"
                  )}
                >
                  My Portfolio
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Toggle Dark Mode */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={isDark} onChange={toggleDark} />
            <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition-colors duration-300"></div>
            <div
              className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
                isDark ? "translate-x-4" : ""
              }`}
            ></div>
            <span className="ml-2 text-sm">{isDark ? "🌙" : "☀️"}</span>
          </label>

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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer relative flex items-center">
                    Dashboard
                    {hasUnreadMessages && (
                      <NotificationDot className="ml-2" />
                    )}
                  </Link>
                </DropdownMenuItem>
                {/* Only show Portfolio link in dropdown for editors (non-client users) */}
                {!isClient && (
                  <DropdownMenuItem asChild>
                    <Link to="/portfolio" className="w-full cursor-pointer">My Portfolio</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard?tab=account" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="font-medium">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-medium bg-primary text-white hover:bg-primary/90">
                  Sign Up
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
