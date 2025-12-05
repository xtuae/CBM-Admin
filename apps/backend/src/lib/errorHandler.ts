export interface ErrorResponse {
  error: string;
  code?: string | undefined;
  details?: any;
  timestamp?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

// Predefined error classes for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource not found') {
    super(resource, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed', details?: any) {
    super(message, 402, 'PAYMENT_ERROR', details);
  }
}

// Standardized error response formatter
export const formatErrorResponse = (error: Error | AppError): ErrorResponse => {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
    };
  }

  return {
    error: error.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp,
  };
};

// Global error handler middleware
export const errorHandler = (error: Error, req: any, res: any, next: any) => {
  // Log the error (in production, send to monitoring service)
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.url,
    userId: req.user?.id || 'anonymous',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: (error as AppError).statusCode || 500,
      code: (error as AppError).code,
      details: (error as AppError).details,
    },
  };

  // In production, send to logging service
  console.error('API Error:', JSON.stringify(logEntry, null, 2));

  // Special handling for financial/payment errors
  if (error instanceof PaymentError || (error as AppError).code === 'PAYMENT_ERROR') {
    // Log detailed payment failure information
    console.error('PAYMENT FAILURE:', {
      timestamp,
      userId: req.user?.id,
      method: req.method,
      url: req.url,
      error: error.message,
      details: (error as AppError).details,
      requestBody: req.method !== 'GET' ? req.body : undefined,
    });
  }

  // Special handling for settlement errors
  if (req.url.includes('/nila-transfers') && req.method !== 'GET') {
    console.error('SETTLEMENT ERROR:', {
      timestamp,
      userId: req.user?.id,
      method: req.method,
      url: req.url,
      error: error.message,
      code: (error as AppError).code,
      details: (error as AppError).details,
    });
  }

  const errorResponse = formatErrorResponse(error);
  const statusCode = (error as AppError).statusCode || 500;

  res.status(statusCode).json(errorResponse);
};

// Exception handler for uncaught exceptions
export const unhandledException = (error: Error) => {
  const timestamp = new Date().toISOString();
  console.error('UNHANDLED EXCEPTION:', JSON.stringify({
    timestamp,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  }, null, 2));

  process.exit(1);
};

// Rejection handler for unhandled promise rejections
export const unhandledRejection = (reason: any, promise: Promise<any>) => {
  const timestamp = new Date().toISOString();
  console.error('UNHANDLED REJECTION:', JSON.stringify({
    timestamp,
    reason,
    promise: promise.toString(),
  }, null, 2));

  process.exit(1);
};

// Success logging middleware (for debugging)
export const logRequest = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: duration,
      userId: req.user?.id || 'anonymous',
    };

    // Only log non-GET requests or errors
    if (res.statusCode >= 400 || ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      console.log('REQUEST LOG:', JSON.stringify(logEntry));
    }
  });

  next();
};

// Payment/settlement specific logging
export const logPaymentActivity = async (userId: string, activity: string, details: any = {}) => {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    userId,
    activity,
    ...details,
  };

  console.log('PAYMENT ACTIVITY:', JSON.stringify(logEntry));
};

export const logSettlementActivity = async (userId: string, settlementId: string, activity: string, details: any = {}) => {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    userId,
    settlementId,
    activity,
    ...details,
  };

  console.log('SETTLEMENT ACTIVITY:', JSON.stringify(logEntry));
};

// Admin activity logging for audit trail
export const logAdminActivity = async (
  adminUserId: string,
  actionType: string,
  entityType: string,
  entityId?: string,
  metadata?: any,
  oldValues?: any,
  newValues?: any
) => {
  try {
    // Import supabase here to avoid circular dependency
    const { supabase } = await import('../lib/supabase');

    const activityData = {
      admin_user_id: adminUserId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || {},
      old_values: oldValues || {},
      new_values: newValues || {},
    };

    const { error } = await supabase
      .from('admin_activity_log')
      .insert(activityData);

    if (error) {
      console.error('Failed to log admin activity:', error);
      // Don't throw - logging failure shouldn't break the main operation
    }

  } catch (err) {
    console.error('Error in logAdminActivity:', err);
    // Don't throw - logging failure shouldn't break the main operation
  }
};
