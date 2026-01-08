import { cn } from '../../lib/utils';

export interface UpgradeCTAProps {
  monthlyPrice: number;
  trialDaysRemaining?: number | null;
  onUpgradeClick?: () => void;
  className?: string;
  variant?: 'banner' | 'card' | 'inline';
}

export function UpgradeCTA({
  monthlyPrice,
  trialDaysRemaining,
  onUpgradeClick,
  className,
  variant = 'card',
}: UpgradeCTAProps) {
  const handleClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default: navigate to pricing page (to be implemented)
      window.location.href = '/pricing';
    }
  };

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg',
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="font-medium">
              Unlock full path - ${monthlyPrice}/mo
            </span>
          </div>
          <button
            onClick={handleClick}
            className="bg-white text-primary-700 px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
        {trialDaysRemaining !== null && trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
          <p className="text-primary-100 text-sm mt-2">
            {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left in your free trial
          </p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors',
          className
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Unlock full path - ${monthlyPrice}/mo
      </button>
    );
  }

  // Default: card variant
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary-600 text-white p-3 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-secondary-900">
            Unlock Your Full Learning Path
          </h3>
          <p className="text-secondary-600 mt-1 text-sm">
            Get access to all phases, personalized roadmaps, and coaching support.
          </p>

          {trialDaysRemaining !== null && trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="bg-warning-100 text-warning-800 px-2 py-0.5 rounded-full font-medium">
                {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left
              </span>
              <span className="text-secondary-500">in your free trial</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleClick}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Upgrade to Pro - ${monthlyPrice}/mo
            </button>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-secondary-600">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              All phases unlocked
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Personalized roadmap
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Weekly coaching
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Priority support
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
