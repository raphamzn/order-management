/**
 * Erros de regra de negócio, independentes do transporte HTTP.
 * O `status` é usado pelo filtro para traduzir em resposta REST.
 */
export class DomainException extends Error {
  constructor(
    message: string,
    readonly status: number = 422,
    readonly code = 'BUSINESS_RULE_VIOLATION',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} ${id} não encontrado`, 404, 'ENTITY_NOT_FOUND');
  }
}

export class InvalidStateTransitionException extends DomainException {
  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} -> ${to}`, 409, 'INVALID_STATE_TRANSITION');
  }
}

export class BusinessRuleException extends DomainException {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}
