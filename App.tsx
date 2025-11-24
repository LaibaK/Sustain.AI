import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole, useInitializeAccessControl } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import { useEffect, useState } from 'react';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [isInitializingAccess, setIsInitializingAccess] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  const { data: userRole, isLoading: roleLoading, error: roleError, isFetched: roleFetched } = useGetCallerUserRole();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, refetch: refetchProfile } = useGetCallerUserProfile();
  const initializeAccessControl = useInitializeAccessControl();

  const isAuthenticated = !!identity;

  // Detect if access control needs initialization
  useEffect(() => {
    if (!isAuthenticated || isInitializingAccess || initializationAttempted) return;

    const needsInitialization = roleFetched && (
      roleError || 
      userRole === 'guest' || 
      userRole === undefined
    );

    if (needsInitialization) {
      console.log('[Access Control] Initializing access control for authenticated user...');
      setIsInitializingAccess(true);
      setInitializationAttempted(true);

      initializeAccessControl.mutate(undefined, {
        onSuccess: () => {
          console.log('[Access Control] Access control initialized successfully');
          setIsInitializingAccess(false);
          // Refetch profile after initialization
          setTimeout(() => {
            refetchProfile();
          }, 500);
        },
        onError: (error) => {
          console.error('[Access Control] Failed to initialize access control:', error);
          setIsInitializingAccess(false);
          // Reset attempt flag to allow retry
          setInitializationAttempted(false);
        },
      });
    }
  }, [isAuthenticated, roleFetched, roleError, userRole, isInitializingAccess, initializationAttempted, initializeAccessControl, refetchProfile]);

  // Reset initialization state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setInitializationAttempted(false);
      setIsInitializingAccess(false);
    }
  }, [isAuthenticated]);

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null && !isInitializingAccess;

  // Show loading during initial app load or actor initialization
  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show login page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoginPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show access control initialization state
  if (isInitializingAccess) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Initializing access control...</p>
            <p className="text-xs text-muted-foreground/70">Setting up your account</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show loading while fetching user data
  if (roleLoading || !profileFetched) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your data...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {showProfileSetup && <ProfileSetupModal />}
      <Dashboard />
      <Toaster />
    </ThemeProvider>
  );
}
