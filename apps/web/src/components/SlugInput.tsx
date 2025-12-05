import { useState, useEffect, forwardRef } from 'react';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  baseSlug?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  autoGenerate?: boolean;
  onValidate?: (slug: string) => Promise<{ isValid: boolean; message?: string }>;
}

export const SlugInput = forwardRef<HTMLInputElement, SlugInputProps>(({
  value,
  onChange,
  baseSlug,
  placeholder = "auto-generated-slug",
  className = "",
  disabled = false,
  label,
  helperText,
  autoGenerate = true,
  onValidate
}, ref) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message?: string } | null>(null);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // Generate slug from baseSlug when it changes and auto-generation is enabled
  useEffect(() => {
    if (autoGenerate && baseSlug && !hasBeenEdited && !value) {
      const generatedSlug = generateSlugFromName(baseSlug);
      onChange(generatedSlug);
    }
  }, [baseSlug, autoGenerate, hasBeenEdited, value, onChange]);

  // Validate slug when it changes
  useEffect(() => {
    if (value && onValidate) {
      setIsValidating(true);
      const debounceTimer = setTimeout(async () => {
        try {
          const result = await onValidate(value);
          setValidationResult(result);
        } finally {
          setIsValidating(false);
        }
      }, 300); // Debounce validation

      return () => clearTimeout(debounceTimer);
    } else {
      setValidationResult(null);
      setIsValidating(false);
    }
  }, [value, onValidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow lowercase letters, numbers, and hyphens
    const cleanValue = newValue.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange(cleanValue);
    setHasBeenEdited(true);
  };

  const handleClear = () => {
    onChange('');
    setHasBeenEdited(false);
    setValidationResult(null);
  };

  const handleRegenerate = () => {
    if (baseSlug) {
      const generatedSlug = generateSlugFromName(baseSlug);
      onChange(generatedSlug);
      setHasBeenEdited(false);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      );
    }

    if (validationResult) {
      return validationResult.isValid ? (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }

    return null;
  };

  const getValidationClass = () => {
    if (!validationResult) return '';

    return validationResult.isValid
      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
      : 'border-red-300 focus:ring-red-500 focus:border-red-500';
  };

  return (
    <div className={`slug-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">/</span>
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full pl-7 pr-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${getValidationClass()}`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {getValidationIcon()}

          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear slug"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {autoGenerate && baseSlug && !disabled && (
            <button
              type="button"
              onClick={handleRegenerate}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Regenerate from title"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-1 flex items-start justify-between">
        <div className="flex-1">
          {validationResult && !validationResult.isValid && (
            <p className="text-sm text-red-600">{validationResult.message}</p>
          )}

          {helperText && !validationResult?.message && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>

        <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
          {value.length}/100
        </div>
      </div>
    </div>
  );
});

SlugInput.displayName = 'SlugInput';

// Utility function to generate slug from name
export const generateSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
};
