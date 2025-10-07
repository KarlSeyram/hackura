
'use client';
import {
  DocumentReference,
  setDoc,
  updateDoc,
  deleteDoc,
  SetOptions,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Executes a setDoc operation in a non-blocking manner with centralized error handling.
 * @param {DocumentReference} docRef - The document reference to set.
 * @param {any} data - The data to write to the document.
 * @param {SetOptions} [options] - Options for the set operation (e.g., { merge: true }).
 */
export function nonBlockingSetDoc(docRef: DocumentReference, data: any, options?: SetOptions): void {
  setDoc(docRef, data, options || {}).catch(error => {
    const contextualError = new FirestorePermissionError({
      operation: options && 'merge' in options ? 'update' : 'create',
      path: docRef.path,
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

/**
 * Executes an updateDoc operation in a non-blocking manner with centralized error handling.
 * @param {DocumentReference} docRef - The document reference to update.
 * @param {any} data - The data to update in the document.
 */
export function nonBlockingUpdateDoc(docRef: DocumentReference, data: any): void {
  updateDoc(docRef, data).catch(error => {
    const contextualError = new FirestorePermissionError({
      operation: 'update',
      path: docRef.path,
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

/**
 * Executes a deleteDoc operation in a non-blocking manner with centralized error handling.
 * @param {DocumentReference} docRef - The document reference to delete.
 */
export function nonBlockingDeleteDoc(docRef: DocumentReference): void {
  deleteDoc(docRef).catch(error => {
    const contextualError = new FirestorePermissionError({
      operation: 'delete',
      path: docRef.path,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}
