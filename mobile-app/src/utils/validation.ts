// Validation utilities for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  rule: (value: any) => boolean;
  message: string;
}

// Common validation rules
export const validationRules = {
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  },

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value: string): boolean => {
    // Ethiopian phone number validation
    const phoneRegex = /^(\+251|0)[9|7][0-9]{8}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  minLength: (min: number) => (value: string): boolean => {
    return value.length >= min;
  },

  maxLength: (max: number) => (value: string): boolean => {
    return value.length <= max;
  },

  numeric: (value: any): boolean => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  positive: (value: number): boolean => {
    return value > 0;
  },

  range: (min: number, max: number) => (value: number): boolean => {
    return value >= min && value <= max;
  },
};

// Validate a single field
export const validateField = (
  value: any,
  rules: ValidationRule[]
): ValidationResult => {
  const errors: string[] = [];

  for (const { rule, message } of rules) {
    if (!rule(value)) {
      errors.push(message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate multiple fields
export const validateForm = (
  data: Record<string, any>,
  fieldRules: Record<string, ValidationRule[]>
): ValidationResult => {
  const allErrors: string[] = [];

  for (const [field, rules] of Object.entries(fieldRules)) {
    const result = validateField(data[field], rules);
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// Specific validation schemas
export const authValidation = {
  login: {
    identifier: [
      { rule: validationRules.required, message: 'Username or email is required' },
    ],
    password: [
      { rule: validationRules.required, message: 'Password is required' },
    ],
  },

  register: {
    username: [
      { rule: validationRules.required, message: 'Username is required' },
      { rule: validationRules.minLength(3), message: 'Username must be at least 3 characters' },
      { rule: validationRules.maxLength(30), message: 'Username must be less than 30 characters' },
    ],
    email: [
      { rule: validationRules.required, message: 'Email is required' },
      { rule: validationRules.email, message: 'Please enter a valid email address' },
    ],
    password: [
      { rule: validationRules.required, message: 'Password is required' },
      { rule: validationRules.minLength(6), message: 'Password must be at least 6 characters' },
    ],
    full_name: [
      { rule: validationRules.required, message: 'Full name is required' },
      { rule: validationRules.minLength(2), message: 'Full name must be at least 2 characters' },
    ],
    phone: [
      { rule: validationRules.required, message: 'Phone number is required' },
      { rule: validationRules.phone, message: 'Please enter a valid Ethiopian phone number' },
    ],
  },
};

export const cropValidation = {
  create: {
    name: [
      { rule: validationRules.required, message: 'Crop name is required' },
    ],
    quantity: [
      { rule: validationRules.required, message: 'Quantity is required' },
      { rule: validationRules.numeric, message: 'Quantity must be a number' },
      { rule: validationRules.positive, message: 'Quantity must be positive' },
    ],
    price_per_unit: [
      { rule: validationRules.required, message: 'Price per unit is required' },
      { rule: validationRules.numeric, message: 'Price must be a number' },
      { rule: validationRules.positive, message: 'Price must be positive' },
    ],
    quality_grade: [
      { rule: validationRules.required, message: 'Quality grade is required' },
    ],
  },
};

export const transportValidation = {
  book: {
    origin: [
      { rule: validationRules.required, message: 'Origin location is required' },
    ],
    destination: [
      { rule: validationRules.required, message: 'Destination location is required' },
    ],
    crop_type: [
      { rule: validationRules.required, message: 'Crop type is required' },
    ],
    quantity: [
      { rule: validationRules.required, message: 'Quantity is required' },
      { rule: validationRules.numeric, message: 'Quantity must be a number' },
      { rule: validationRules.positive, message: 'Quantity must be positive' },
    ],
  },
};

// Sanitize input data
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('251')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+251${cleaned.substring(1)}`;
  } else {
    return `+251${cleaned}`;
  }
};

// Validate Ethiopian ID number (basic validation)
export const validateEthiopianId = (id: string): boolean => {
  // Ethiopian ID numbers are typically 12 digits
  const idRegex = /^\d{12}$/;
  return idRegex.test(id.replace(/\s/g, ''));
};
