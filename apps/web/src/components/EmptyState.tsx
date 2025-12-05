import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  className = ""
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {(actionLabel && (actionHref || actionOnClick)) && (
        actionHref ? (
          <Link to={actionHref}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={actionOnClick} variant="primary">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};

// Pre-configured empty states for common use cases
export const EmptyMarketplace = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    }
    title="No credit packs available"
    description="We're working on adding credit packs to our marketplace. Check back soon or contact support for assistance."
    actionLabel="Browse Categories"
    actionHref="/marketplace?category=all"
  />
);

export const EmptyWishlist = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    }
    title="Your wishlist is empty"
    description="Find credit packs you like and save them here for easy access later."
    actionLabel="Browse Marketplace"
    actionHref="/marketplace"
  />
);

export const EmptyCart = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
      </svg>
    }
    title="Your cart is empty"
    description="Add some credit packs to get started with your purchase."
    actionLabel="Shop Now"
    actionHref="/marketplace"
  />
);

export const EmptyOrders = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    title="No orders found"
    description="You haven't made any purchases yet. Start by browsing our marketplace."
    actionLabel="Browse Marketplace"
    actionHref="/marketplace"
  />
);

// Empty state for categories
export const EmptyCategories = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    }
    title="No categories available"
    description="There are currently no product categories to browse."
    actionLabel="Browse All Products"
    actionHref="/marketplace"
  />
);

// Empty state for ledger/transactions
export const EmptyLedger = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    }
    title="No transactions found"
    description="Your credit transaction history will appear here once you make purchases."
    actionLabel="Browse Marketplace"
    actionHref="/marketplace"
  />
);

// Empty state for wallet addresses
export const EmptyWallets = () => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    }
    title="No wallet addresses"
    description="Add your blockchain wallet addresses to receive rewards and track your digital assets."
    actionLabel="Add Wallet"
    actionOnClick={() => {
      // This would trigger the add wallet modal
      console.log('Add wallet clicked');
    }}
  />
);

export default EmptyState;
