import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// UUID validation
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Name validation
export const validateName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, apostrophes, max 100 chars
  const nameRegex = /^[a-zA-Z\s\-']{1,100}$/;
  return nameRegex.test(name.trim());
};

// Amount validation
export const validatePositiveAmount = (amount: any, minValue = 0.01, maxValue = 1000000): ValidationResult => {
  const errors: string[] = [];

  if (amount === null || amount === undefined || amount === '') {
    errors.push('Amount is required');
    return { isValid: false, errors };
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
    return { isValid: false, errors };
  }

  if (numAmount <= minValue) {
    errors.push(`Amount must be greater than ${minValue}`);
    return { isValid: false, errors };
  }

  if (numAmount > maxValue) {
    errors.push(`Amount must not exceed ${maxValue}`);
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedData: numAmount };
};

// Integer validation
export const validatePositiveInteger = (value: any, minValue = 1, maxValue = 1000000): ValidationResult => {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push('Value is required');
    return { isValid: false, errors };
  }

  const numValue = Number(value);
  if (isNaN(numValue) || !Number.isInteger(numValue)) {
    errors.push('Value must be a valid integer');
    return { isValid: false, errors };
  }

  if (numValue < minValue) {
    errors.push(`Value must be ${minValue} or greater`);
    return { isValid: false, errors };
  }

  if (numValue > maxValue) {
    errors.push(`Value must not exceed ${maxValue}`);
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedData: numValue };
};

// Text validation
export const validateText = (text: string, maxLength = 1000, required = false): ValidationResult => {
  const errors: string[] = [];

  if (required && (!text || text.trim().length === 0)) {
    errors.push('Text is required');
    return { isValid: false, errors };
  }

  if (text && text.length > maxLength) {
    errors.push(`Text must not exceed ${maxLength} characters`);
    return { isValid: false, errors };
  }

  // Basic XSS prevention - remove potentially dangerous characters
  const sanitized = text ? text.trim().replace(/[<>]/g, '') : '';

  return { isValid: true, errors: [], sanitizedData: sanitized };
};

// Wallet address validation
export const validateWalletAddress = (address: string, network: string): ValidationResult => {
  const errors: string[] = [];

  if (!address || address.trim().length === 0) {
    errors.push('Wallet address is required');
    return { isValid: false, errors };
  }

  const trimmed = address.trim().toLowerCase();
  const validNetworks = ['polygon', 'ethereum', 'solana', 'bitcoin'];

  if (!validNetworks.includes(network.toLowerCase())) {
    errors.push('Invalid blockchain network');
    return { isValid: false, errors };
  }

  // Basic length and format validation (can be expanded per network)
  if (trimmed.length < 20 || trimmed.length > 100) {
    errors.push('Wallet address format is invalid');
    return { isValid: false, errors };
  }

  // Ethereum/Polygon address format (0x...)
  if (['ethereum', 'polygon'].includes(network.toLowerCase())) {
    if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
      errors.push('Invalid Ethereum/Polygon address format');
      return { isValid: false, errors };
    }
  }

  return { isValid: true, errors: [], sanitizedData: trimmed };
};

// Slug validation
export const validateSlug = (slug: string): ValidationResult => {
  const errors: string[] = [];

  if (!slug || slug.trim().length === 0) {
    errors.push('Slug is required');
    return { isValid: false, errors };
  }

  const trimmed = slug.trim().toLowerCase();

  // Only allow lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(trimmed)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    return { isValid: false, errors };
  }

  // Check length
  if (trimmed.length < 3) {
    errors.push('Slug must be at least 3 characters long');
    return { isValid: false, errors };
  }

  if (trimmed.length > 100) {
    errors.push('Slug must not exceed 100 characters');
    return { isValid: false, errors };
  }

  // Cannot start or end with hyphen
  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedData: trimmed };
};

// Slug uniqueness validation (async)
export const validateSlugUniqueness = async (table: string, slug: string, excludeId?: string): Promise<ValidationResult> => {
  try {
    const { supabase } = await import('../lib/supabase');

    const query = supabase
      .from(table)
      .select('id')
      .eq('slug', slug)
      .limit(1);

    // If we're editing, exclude the current record
    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error checking ${table} slug uniqueness:`, error);
      return { isValid: false, errors: [`Failed to validate slug uniqueness`] };
    }

    if (data && data.length > 0) {
      return { isValid: false, errors: [`Slug "${slug}" is already in use`] };
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    console.error('Slug uniqueness validation error:', error);
    return { isValid: false, errors: ['Slug validation failed'] };
  }
};

// Pagination validation
export const validatePagination = (page: any, limit: any): ValidationResult => {
  const errors: string[] = [];

  const pageValidation = validatePositiveInteger(page, 1, 10000);
  if (!pageValidation.isValid) {
    errors.push(...pageValidation.errors.map(e => `Page: ${e}`));
  }

  const limitValidation = validatePositiveInteger(limit, 1, 100);
  if (!limitValidation.isValid) {
    errors.push(...limitValidation.errors.map(e => `Limit: ${e}`));
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: {
      page: pageValidation.sanitizedData,
      limit: limitValidation.sanitizedData
    }
  };
};

// Middleware to validate request body fields
export const validateBodyFields = (requiredFields: string[], validations?: Record<string, (value: any) => ValidationResult>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const body = req.body;

    // Check required fields
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        errors.push(`${field} is required`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(', ') });
      return;
    }

    // Run validations if provided
    if (validations) {
      const validationErrors: string[] = [];
      const sanitizedBody: any = { ...body };

      for (const [field, validator] of Object.entries(validations)) {
        const result = validator(body[field]);
        if (!result.isValid) {
          validationErrors.push(...result.errors);
        } else if (result.sanitizedData !== undefined) {
          sanitizedBody[field] = result.sanitizedData;
        }
      }

      if (validationErrors.length > 0) {
        res.status(400).json({ error: validationErrors.join(', ') });
        return;
      }

      // Replace request body with sanitized data
      (req as any).sanitizedBody = sanitizedBody;
    }

    next();
  };
};

// Middleware to validate UUID parameters
export const validateUUIDParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];

    if (!value) {
      res.status(400).json({ error: `${paramName} is required` });
      return;
    }

    if (!validateUUID(value)) {
      res.status(400).json({ error: `Invalid ${paramName} format` });
      return;
    }

    next();
  };
};

// State transition validation for settlements
export const validateSettlementTransition = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;

  if (!status) {
    next(); // No status change, continue
    return;
  }

  // Only allow specific transitions
  const validTransitions: Record<string, string[]> = {
    'pending': ['processing'],
    'processing': ['confirmed', 'failed'],
    'confirmed': [], // Final state
    'failed': [], // Final state
    'cancelled': [], // Final state
  };

  // Get current transfer status (would need to fetch from DB)
  // For now, we'll allow the transitions as long as they're logically valid
  const allowedStates = ['pending', 'processing', 'confirmed', 'failed', 'cancelled'];

  if (!allowedStates.includes(status)) {
    res.status(400).json({ error: `Invalid status. Valid statuses: ${allowedStates.join(', ')}` });
    return;
  }

  // Check for transaction_hash requirement
  if (status === 'confirmed' && !req.body.transaction_hash) {
    res.status(400).json({ error: 'Transaction hash is required when confirming a settlement' });
    return;
  }

  next();
};

// Balance validation middleware
export const validateCreditBalance = (userId: string, requiredAmount: number) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { supabase } = await import('../lib/supabase');

      // Get current balance
      const { data: ledgerEntries, error } = await supabase
        .from('credit_ledger')
        .select('amount')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking balance:', error);
        res.status(500).json({ error: 'Failed to validate balance' });
        return;
      }

      const currentBalance = ledgerEntries?.reduce((total, entry) => total + entry.amount, 0) || 0;

      if (currentBalance < requiredAmount) {
        res.status(400).json({
          error: 'Insufficient credit balance',
          current_balance: currentBalance,
          required_amount: requiredAmount
        });
        return;
      }

      // Add balance info to request
      (req as any).currentBalance = currentBalance;
      next();
    } catch (error) {
      console.error('Balance validation error:', error);
      res.status(500).json({ error: 'Balance validation failed' });
    }
  };
};

// Check if balance would go negative after operation
export const validateNoNegativeBalance = async (userId: string, amountChange: number, supabase: any): Promise<ValidationResult> => {
  try {
    const { data: ledgerEntries, error } = await supabase
      .from('credit_ledger')
      .select('amount')
      .eq('user_id', userId);

    if (error) {
      return { isValid: false, errors: ['Failed to check current balance'] };
    }

    const currentBalance = ledgerEntries?.reduce((total: number, entry: any) => total + entry.amount, 0) || 0;
    const newBalance = currentBalance + amountChange;

    if (newBalance < 0) {
      return {
        isValid: false,
        errors: [`Operation would result in negative balance. Current: ${currentBalance}, Change: ${amountChange}, Result: ${newBalance}`]
      };
    }

    return { isValid: true, errors: [], sanitizedData: { currentBalance, newBalance } };
  } catch (error) {
    return { isValid: false, errors: ['Balance validation failed'] };
  }
};

// Comprehensive request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // You could implement a more sophisticated schema validation here
      // For now, this is a placeholder for future schema validation
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request format' });
    }
  };
};
