/**
 * Error Handler Utility
 * Parsea errores de la API y los convierte en mensajes amigables para el usuario
 */

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface ParsedError {
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  originalError?: string;
}

/**
 * Tipos de errores comunes de MySQL/Base de datos
 */
const ERROR_PATTERNS = {
  DUPLICATE_ENTRY: /Duplicate entry '(.+?)' for key '(.+?)'/i,
  FOREIGN_KEY: /foreign key constraint/i,
  NOT_NULL: /Column '(.+?)' cannot be null/i,
  DATA_TOO_LONG: /Data too long for column '(.+?)'/i,
  UNKNOWN_COLUMN: /Unknown column '(.+?)'/i,
  CONNECTION: /connection/i,
  TIMEOUT: /timeout/i,
  NETWORK: /network|failed to fetch|networkerror/i,
};

/**
 * Mapeo de nombres de columnas a nombres amigables
 */
const COLUMN_FRIENDLY_NAMES: Record<string, string> = {
  dni: 'DNI',
  email: 'correo electrónico',
  phone_number: 'número de teléfono',
  name: 'nombre',
  second_name: 'apellido',
  birthdate: 'fecha de nacimiento',
  societary_cuote: 'cuota societaria',
};

/**
 * Parsea el mensaje de error y retorna un objeto con título y mensaje amigable
 */
export function parseApiError(error: unknown): ParsedError {
  // Si es un objeto con success: false y message
  if (isApiErrorResponse(error)) {
    return parseErrorMessage(error.message);
  }

  // Si es un Error nativo de JavaScript
  if (error instanceof Error) {
    return parseErrorMessage(error.message);
  }

  // Si es un string
  if (typeof error === 'string') {
    return parseErrorMessage(error);
  }

  // Error desconocido
  return {
    title: 'Error inesperado',
    message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
    type: 'danger',
    originalError: String(error),
  };
}

/**
 * Parsea un mensaje de error específico
 */
function parseErrorMessage(message: string): ParsedError {
  // Error de entrada duplicada (DNI, email, etc)
  const duplicateMatch = message.match(ERROR_PATTERNS.DUPLICATE_ENTRY);
  if (duplicateMatch) {
    const [, value, key] = duplicateMatch;
    const friendlyKey = COLUMN_FRIENDLY_NAMES[key] || key;
    
    return {
      title: 'Registro duplicado',
      message: `Ya existe un socio con el ${friendlyKey}: "${value}". Por favor, verifica los datos ingresados.`,
      type: 'danger',
      originalError: message,
    };
  }

  // Error de foreign key (referencia a otro registro)
  if (ERROR_PATTERNS.FOREIGN_KEY.test(message)) {
    return {
      title: 'Error de referencia',
      message: 'No se puede realizar la operación porque hay registros relacionados. Por favor, verifica las dependencias.',
      type: 'warning',
      originalError: message,
    };
  }

  // Campo requerido vacío
  const notNullMatch = message.match(ERROR_PATTERNS.NOT_NULL);
  if (notNullMatch) {
    const [, column] = notNullMatch;
    const friendlyColumn = COLUMN_FRIENDLY_NAMES[column] || column;
    
    return {
      title: 'Campo requerido',
      message: `El campo "${friendlyColumn}" es obligatorio. Por favor, complétalo antes de continuar.`,
      type: 'warning',
      originalError: message,
    };
  }

  // Datos demasiado largos
  const tooLongMatch = message.match(ERROR_PATTERNS.DATA_TOO_LONG);
  if (tooLongMatch) {
    const [, column] = tooLongMatch;
    const friendlyColumn = COLUMN_FRIENDLY_NAMES[column] || column;
    
    return {
      title: 'Dato demasiado largo',
      message: `El valor ingresado en "${friendlyColumn}" es demasiado largo. Por favor, ingresa un valor más corto.`,
      type: 'warning',
      originalError: message,
    };
  }

  // Columna desconocida (error de desarrollo)
  const unknownColumnMatch = message.match(ERROR_PATTERNS.UNKNOWN_COLUMN);
  if (unknownColumnMatch) {
    return {
      title: 'Error del sistema',
      message: 'Ocurrió un error técnico. Por favor, contacta al administrador del sistema.',
      type: 'danger',
      originalError: message,
    };
  }

  // Errores de conexión
  if (ERROR_PATTERNS.CONNECTION.test(message) || ERROR_PATTERNS.TIMEOUT.test(message)) {
    return {
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
      type: 'danger',
      originalError: message,
    };
  }

  // Errores de red
  if (ERROR_PATTERNS.NETWORK.test(message)) {
    return {
      title: 'Error de red',
      message: 'No se pudo completar la solicitud. Por favor, verifica tu conexión a internet.',
      type: 'danger',
      originalError: message,
    };
  }

  // Missing fields
  if (message.toLowerCase().includes('missing fields')) {
    return {
      title: 'Campos incompletos',
      message: 'Por favor, completa todos los campos requeridos antes de continuar.',
      type: 'warning',
      originalError: message,
    };
  }

  // Error genérico
  return {
    title: 'Error',
    message: message || 'Ocurrió un error al procesar la solicitud. Por favor, intenta nuevamente.',
    type: 'danger',
    originalError: message,
  };
}

/**
 * Type guard para verificar si es una respuesta de error de API
 */
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    error.success === false &&
    'message' in error &&
    typeof (error).message === 'string'
  );
}

/**
 * Helper para logging de errores en desarrollo
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error${context ? ` - ${context}` : ''}`);
    console.error('Original error:', error);
    console.error('Parsed error:', parseApiError(error));
    console.groupEnd();
  }
}