'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A client-side component that listens for globally emitted Firestore permission errors
 * and displays them to the user using a toast notification. This component should be
 * placed in your root layout to catch errors from anywhere in the app.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    // Define the callback function for handling permission errors.
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error Caught:', error);
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: `You do not have permission to ${error.operation} data at "${error.path}". Please check your security rules or login status.`,
      });
    };

    // Subscribe to the 'permission-error' event when the component mounts.
    errorEmitter.on('permission-error', handlePermissionError);

    // Unsubscribe from the event when the component unmounts to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]); // The effect depends on the toast function.

  // This component does not render any visible UI itself.
  return null;
}
