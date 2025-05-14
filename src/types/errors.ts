export class ValidationError extends Error {
  statusCode: number;
  details: string;
  code: string;

  constructor(details: string, code: string, statusCode = 400) {
    super('Erro na validação: algum campo da requisição não é válido.');
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ValidationError';
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
