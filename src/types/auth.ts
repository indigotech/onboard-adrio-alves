import { ValidationError } from './errors';

export interface AuthDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export function isValidCredentialsInput(input: any): input is AuthDTO {
  const isValid =
    typeof input === 'object' &&
    typeof input.email === 'string' &&
    typeof input.password === 'string' &&
    (typeof input.rememberMe === 'undefined' || typeof input.rememberMe === 'boolean');

  if (!isValid) {
    throw new ValidationError('Invalid credentials input', 'AUTH_VALIDATION');
  }

  return true;
}
