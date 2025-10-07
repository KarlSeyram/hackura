
'use client';

/**
 * Defines the security context for a Firestore operation that was denied.
 * This information is crucial for debugging security rules.
 */
export type SecurityRuleContext = {
  /** The full path to the document or collection being accessed (e.g., 'users/userId'). */
  path: string;
  /** The type of operation being performed. */
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  /**
   * The data being sent with a write request (create, update). This helps debug
   * rules that inspect `request.resource.data`.
   */
  requestResourceData?: any;
};

/**
 * Custom error class for Firestore permission-denied errors.
 * This error is designed to be thrown in the Next.js development environment
 * to provide a rich, contextual overlay for debugging security rules.
 */
export class FirestorePermissionError extends Error {
  /** The security context detailing the failed operation. */
  public readonly context: SecurityRuleContext;
  /** A user-friendly message summarizing the error. */
  public readonly summary: string;

  constructor(context: SecurityRuleContext) {
    // Construct a detailed error message for developers.
    const message = `
Firestore Security Rules Denied Request:
-----------------------------------------
- Operation: ${context.operation.toUpperCase()}
- Path: /${context.path}
- Request Data: ${context.requestResourceData ? JSON.stringify(context.requestResourceData, null, 2) : 'N/A'}
-----------------------------------------
This error was caught by the application's custom error handler.
Check your Firestore security rules to ensure this operation is allowed.
`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.summary = `You do not have permission to ${context.operation} the resource at "${context.path}".`;

    // Ensure the prototype chain is correct.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
