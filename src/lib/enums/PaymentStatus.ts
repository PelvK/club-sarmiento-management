export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  PAID_WITH_SURCHARGE = 'paid_with_surcharge',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled'
}

export enum PAYMENT_TYPE {
  SOCIETARY_ONLY = 'societary-only',
  PRINCIPAL_SPORT = 'principal-sport',
  SECONDARY_SPORT = 'secondary-sport',
}

export enum BREAKDOWN_TYPE {
  SOCIETARY = 'societary',
  PRINCIPAL_SPORT = 'principal-sport',
  SECONDARY_SPORT = 'secondary-sport',
  ADDITION = 'addition',
}