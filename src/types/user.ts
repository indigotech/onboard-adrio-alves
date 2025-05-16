import { ValidationError } from "./errors";

export interface UserDTO {
  name: string;
  email: string;
  password: string;
  birthdate?: string;
}


export function isValidUserInput(input: any): input is UserDTO {
  const isValid =
    typeof input === 'object' &&
    typeof input.name === 'string' &&
    typeof input.email === 'string' &&
    typeof input.password === 'string' &&
    (typeof input.birthdate === 'undefined' || typeof input.birthdate === 'string');

  if (!isValid) {
    throw new ValidationError('Invalid user input', 'USER_VALIDATION');
  }

  return true;
}