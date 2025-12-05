import { useState, useEffect } from 'react';

// Language configuration
export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName?: string;
}

// Currency configuration
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate?: number; // To be set by external API
}

// Default configurations
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', exchangeRate: 1 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
];

// Storage keys
const LANGUAGE_STORAGE_KEY = 'selected_language';
const CURRENCY_STORAGE_KEY = 'selected_currency';

/**
 * Custom hook for managing language and currency preferences
 *
 * This hook provides:
 * - State management for selected language and currency
 * - Persistence across browser sessions
 * - Methods to update preferences
 * - Default fallback values
 *
 * TODO: Integrate with i18n library (e.g., react-i18next)
 * TODO: Integrate with currency conversion API
 */
export const useLocalization = () => {
  // Language state
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = LANGUAGES.find(lang => lang.code === parsed.code);
        if (found) return found;
      } catch (error) {
        console.warn('Invalid language stored, using default');
      }
    }
    return LANGUAGES.find(lang => lang.code === 'en') || LANGUAGES[0];
  });

  // Currency state
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = CURRENCIES.find(curr => curr.code === parsed.code);
        if (found) return found;
      } catch (error) {
        console.warn('Invalid currency stored, using default');
      }
    }
    // Default to AED as requested
    return CURRENCIES.find(curr => curr.code === 'AED') || CURRENCIES[1];
  });

  // Update language with persistence
  const setSelectedLanguage = (language: Language) => {
    setSelectedLanguageState(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify({
      code: language.code,
      name: language.name
    }));

    // TODO: Update i18n library when implemented
    console.log('Language updated to:', language.name);

    // Dispatch custom event for components to react to language changes
    window.dispatchEvent(new CustomEvent('languageChange', {
      detail: { language }
    }));
  };

  // Update currency with persistence
  const setSelectedCurrency = (currency: Currency) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol
    }));

    // TODO: Fetch and update exchange rates when implemented
    console.log('Currency updated to:', currency.code);

    // Dispatch custom event for components to react to currency changes
    window.dispatchEvent(new CustomEvent('currencyChange', {
      detail: { currency }
    }));
  };

  // Utility function to get language by code
  const getLanguage = (code: string): Language | undefined => {
    return LANGUAGES.find(lang => lang.code === code);
  };

  // Utility function to get currency by code
  const getCurrency = (code: string): Currency | undefined => {
    return CURRENCIES.find(curr => curr.code === code);
  };

  // Utility function to reset to defaults
  const resetToDefaults = () => {
    const defaultLanguage = LANGUAGES.find(lang => lang.code === 'en') || LANGUAGES[0];
    const defaultCurrency = CURRENCIES.find(curr => curr.code === 'AED') || CURRENCIES[1];

    setSelectedLanguage(defaultLanguage);
    setSelectedCurrency(defaultCurrency);
  };

  // Utility function to convert price to selected currency
  // TODO: Implement real currency conversion logic
  const convertPrice = (price: number, fromCurrency?: string): number => {
    if (!fromCurrency || fromCurrency === selectedCurrency.code) {
      return price;
    }

    // Mock conversion - replace with real API logic
    const mockRates: Record<string, number> = {
      'USD': 1,
      'AED': 3.67,
      'EUR': 0.92,
      'GBP': 0.79,
      'JPY': 147.5,
    };

    const fromRate = mockRates[fromCurrency] || 1;
    const toRate = mockRates[selectedCurrency.code] || 1;

    // Convert from USD base to target currency
    return (price / fromRate) * toRate;
  };

  // Cleanup function for useEffect in consuming components
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    // State
    selectedLanguage,
    selectedCurrency,
    languages: LANGUAGES,
    currencies: CURRENCIES,

    // Actions
    setSelectedLanguage,
    setSelectedCurrency,
    resetToDefaults,

    // Utilities
    getLanguage,
    getCurrency,
    convertPrice,
  };
};
