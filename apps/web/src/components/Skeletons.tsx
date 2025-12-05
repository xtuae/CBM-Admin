// Loading skeletons for different page layouts using design system

// Marketplace product card skeleton
export const ProductCardSkeleton = () => (
  <div className="card animate-pulse">
    {/* Product Image Placeholder */}
    <div className="aspect-square bg-gray-200 rounded-lg"></div>

    {/* Product Info Skeleton */}
    <div className="p-6 space-y-3">
      {/* Category Badges */}
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
      </div>

      {/* Product Name */}
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>

      {/* Credits Amount */}
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>

      {/* Price */}
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>

      {/* Action Button */}
      <div className="pt-2">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// Product grid skeleton (for marketplace)
export const ProductGridSkeleton = ({ columns = 4 }: { columns?: number }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Product detail page skeleton
export const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start animate-pulse">
      {/* Image skeleton */}
      <div className="w-full">
        <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Product info skeleton */}
      <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
        {/* Title and wishlist button */}
        <div className="flex items-start justify-between">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>

        {/* Price and credits */}
        <div className="space-y-2">
          <div className="h-12 bg-gray-200 rounded w-32"></div>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>

        {/* Categories */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* Description box */}
        <div className="bg-gray-100 rounded-lg p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

        {/* Quantity and buttons */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>

          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="space-y-4 pt-4">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Cart item skeleton
export const CartItemSkeleton = () => (
  <li className="flex py-6 animate-pulse">
    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-200"></div>
    <div className="ml-4 flex-1 flex flex-col">
      <div>
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
      </div>
      <div className="flex-1 flex items-end justify-between">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  </li>
);

// Dashboard card skeleton
export const DashboardCardSkeleton = () => (
  <div className="bg-white overflow-hidden shadow rounded-lg p-5 animate-pulse">
    <div className="flex items-center">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-md"></div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="h-4 bg-gray-200 rounded w-20 mb-2"></dt>
          <dd className="h-6 bg-gray-200 rounded w-24"></dd>
        </dl>
      </div>
    </div>
  </div>
);

// Orders list skeleton
export const OrdersListSkeleton = () => (
  <div className="bg-white shadow overflow-hidden sm:rounded-md animate-pulse">
    <ul className="divide-y divide-gray-200">
      {[...Array(5)].map((_, i) => (
        <li key={i} className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="ml-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// Generic table row skeleton
export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <tr className="animate-pulse">
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    ))}
  </tr>
);

// Form input skeleton
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-6 animate-pulse">
    {[...Array(fields)].map((_, i) => (
      <div key={i}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
    <div className="h-10 bg-blue-200 rounded w-32"></div>
  </div>
);
