import { Button, Card } from './index';

interface OrderSummaryCardProps {
  subtotal: number;
  processingFee: number;
  total: number;
  onProceed: () => void;
  loading?: boolean;
  buttonText?: string;
  showTerms?: boolean;
}

const OrderSummaryCard = ({
  subtotal,
  processingFee,
  total,
  onProceed,
  loading = false,
  buttonText = 'Continue to Checkout',
  showTerms = false
}: OrderSummaryCardProps) => {
  return (
    <Card className="sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Processing Fee</span>
          <span className="font-medium">${processingFee.toFixed(2)}</span>
        </div>

        <hr className="border-light" />

        <div className="flex justify-between text-xl font-semibold text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Processing fee covers secure payment handling and instant digital delivery
        </p>
      </div>

      {showTerms && (
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-light rounded"
              required
            />
            <label htmlFor="accept-terms" className="text-sm text-gray-600 leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:text-primary-hover">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:text-primary-hover">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
      )}

      <Button
        onClick={onProceed}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Processing...' : buttonText}
      </Button>
    </Card>
  );
};

export default OrderSummaryCard;