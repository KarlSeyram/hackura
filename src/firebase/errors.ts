/**
 * Custom error class for Firestore permission-denied errors.
 * This provides more context than the generic Firebase error, making it
 * easier to debug and display user-friendly messages.
 */
export class FirestorePermissionError extends Error {
  public operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  public path: string;

  constructor({
    operation,
    path,
  }: {
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    path: string;
  }) {
    const message = `Firestore permission denied: cannot ${operation} on "${path}".`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.operation = operation;
    this.path = path;
  }
}
