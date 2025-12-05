import { ProductGridSkeleton, ProductDetailSkeleton, OrdersListSkeleton, TableRowSkeleton, FormSkeleton } from './Skeletons';

interface LoadingStateProps {
  type?: 'page' | 'products' | 'product-detail' | 'orders' | 'table' | 'form';
  columns?: number;
  fields?: number;
  rows?: number;
  className?: string;
}

const LoadingState = ({
  type = 'page',
  columns = 4,
  fields = 4,
  rows = 5,
  className = ''
}: LoadingStateProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'products':
        return <ProductGridSkeleton columns={columns} />;
      case 'product-detail':
        return <ProductDetailSkeleton />;
      case 'orders':
        return <OrdersListSkeleton />;
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {[...Array(rows)].map((_, i) => (
                  <TableRowSkeleton key={i} columns={columns} />
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'form':
        return <FormSkeleton fields={fields} />;
      default:
        // Generic page loading
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

export default LoadingState;
