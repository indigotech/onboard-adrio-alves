export class AppError extends Error {
  statusCode: number;
  code: string;
  details: string;
  name: string;
  constructor(name: string, message: string, statusCode: number, code: string, details: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = name;
  }
}

export class ValidationError extends AppError {
  constructor(details: string, code: string, statusCode = 400) {
    super('ValidationError', 'Erro na validação: algum campo da requisição não é válido.', statusCode, code, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(details: string, code: string, statusCode = 409) {
    super('ConflictError', 'Erro de conflito: já existe um recurso com os mesmos dados.', statusCode, code, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
export class AuthError extends AppError {
  constructor(details: string, code:string , statusCode = 401) {
    super('AuthError', 'Erro de autenticação: as credenciais fornecidas não são válidas.', statusCode, code, details);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code: string, statusCode = 404) {
    super('Erro de não encontrado: o recurso solicitado não foi encontrado.');
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
