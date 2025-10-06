'use client';
import {
  DocumentReference,
  setDoc,
  updateDoc,
  deleteDoc,
  // Add other Firestore write operations as needed
} from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Executes a setDoc operation in a non-blocking manner with centralized error handling.
 * @param {DocumentReference} docRef - The document reference to set.
 * @param {any} data - The data to write to the document.
 */
export function nonBlockingSetDoc(docRef: DocumentReference, data: any): void {
  setDoc(docRef, data).catch(error => {
    const contextualError = new FirestorePermissionError({
      operation: 'create', // or 'update' depending on the logic
      path: docRef.path,
    });
    errorEmitter.emit('permission-error', contextualError);
    console.error('Non-blocking setDoc failed:', contextualError);
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
    });
    errorEmitter.emit('permission-error', contextualError);
    console.error('Non-blocking updateDoc failed:', contextualError);
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
    console.error('Non-blocking deleteDoc failed:', contextualError);
  });
}
