import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WishlistButtonProps {
  creditPackId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay'; // overlay for product cards
}

const WishlistButton = ({
  creditPackId,
  className = '',
  size = 'md',
  variant = 'default'
}: WishlistButtonProps) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Check wishlist status on component mount
  useEffect(() => {
    if (user && creditPackId) {
      checkWishlistStatus();
    }
  }, [user, creditPackId]);

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`http://localhost:3000/api/v1/wishlist/${creditPackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.in_wishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/login';
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const method = isInWishlist ? 'DELETE' : 'POST';
      const url = isInWishlist
        ? `http://localhost:3000/api/v1/wishlist/${creditPackId}`
        : 'http://localhost:3000/api/v1/wishlist';

      const body = isInWishlist ? null : JSON.stringify({ credit_pack_id: creditPackId });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
        // Optional: Show success message
        // alert(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        console.error('Wishlist operation failed');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no user (handled by auth redirect in toggle)
  if (!user) {
    return (
      <button
        onClick={toggleWishlist}
        className={`${sizeClasses[size]} ${className} ${
          variant === 'overlay'
            ? 'absolute top-3 right-3 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100'
            : 'inline-flex items-center justify-center text-gray-400 hover:text-red-500'
        } transition-colors duration-200 disabled:opacity-50`}
        disabled={loading}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          className={`${iconSizes[size]} transition-all duration-200 ${
            isInWishlist ? 'text-red-500 fill-current' : 'text-current'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth={isInWishlist ? "0" : "1.5"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      className={`${sizeClasses[size]} ${className} ${
        variant === 'overlay'
          ? 'absolute top-3 right-3 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100'
          : 'inline-flex items-center justify-center text-gray-400 hover:text-red-500'
      } transition-colors duration-200 disabled:opacity-50`}
      disabled={loading}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <svg className={`${iconSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className={`${iconSizes[size]} transition-all duration-200 ${
            isInWishlist ? 'text-red-500 fill-current' : 'text-current'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth={isInWishlist ? "0" : "1.5"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      )}
    </button>
  );
};

export default WishlistButton;
