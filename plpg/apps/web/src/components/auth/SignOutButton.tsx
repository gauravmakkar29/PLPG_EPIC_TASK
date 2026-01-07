import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { track, reset as resetAnalytics } from '../../lib/analytics';

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'danger';
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  variant = 'default',
  className = '',
  children,
}: SignOutButtonProps) {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Track analytics event
      track('logout_completed');

      // Sign out
      logout();

      // Clear TanStack Query cache
      queryClient.clear();

      // Reset Zustand stores to initial state
      useUIStore.setState({
        isSidebarOpen: true,
        isModalOpen: false,
        modalContent: null,
        theme: 'system',
        notifications: [],
      });

      // Reset analytics
      resetAnalytics();

      // Redirect to landing page
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, try to clear state and redirect
      queryClient.clear();
      useUIStore.setState({
        isSidebarOpen: true,
        isModalOpen: false,
        modalContent: null,
        theme: 'system',
        notifications: [],
      });
      navigate('/');
    }
  };

  // Default button styles based on variant
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'ghost':
        return `${baseStyles} text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 ${className}`;
      case 'danger':
        return `${baseStyles} text-red-600 bg-red-50 hover:bg-red-100 ${className}`;
      default:
        return `${baseStyles} text-primary-600 bg-primary-50 hover:bg-primary-100 ${className}`;
    }
  };

  return (
    <button onClick={handleSignOut} className={getButtonStyles()}>
      {children || (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </>
      )}
    </button>
  );
}

