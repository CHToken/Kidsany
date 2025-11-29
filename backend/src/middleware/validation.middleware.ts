import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

// Sanitize input to prevent SQL injection and XSS
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Function to recursively sanitize strings
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters for SQL injection
      // Note: TypeORM parameterizes queries, but this adds extra layer
      return obj
        .replace(/[<>]/g, '') // Remove < and > to prevent XSS
        .trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize body, query, and params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// SQL injection pattern detection (additional security layer)
export const detectSQLInjection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('OR|'AND|' OR|' AND)/gi,
  ];

  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some((pattern) => pattern.test(value));
    } else if (Array.isArray(value)) {
      return value.some(checkForSQLInjection);
    } else if (value !== null && typeof value === 'object') {
      return Object.values(value).some(checkForSQLInjection);
    }
    return false;
  };

  // Check all input sources
  const inputs = [req.body, req.query, req.params];

  for (const input of inputs) {
    if (input && checkForSQLInjection(input)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected. Request blocked.',
      });
    }
  }

  next();
};
