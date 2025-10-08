'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

/**
 * Defines the shape of the context that will be provided to the app.
 * This includes the Firebase services and the current authenticated user state.
 */
interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
  isLoading: boolean;
}

// Create the context with a default value of null.
const FirebaseContext = createContext<FirebaseContextType | null>(null);

/**
* A React hook that provides easy access to the Firebase context.
* It throws an error if used outside of a FirebaseProvider.
*
* @returns {FirebaseContextType} The Firebase context, including app, auth, firestore, user, and loading state.
*/
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

/**
 * A React Provider component that initializes Firebase services and provides them
 * to its children via context. It also listens for authentication state changes
 * and makes the current user and loading state available throughout the app.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to render.
 * @param {FirebaseApp} props.firebaseApp - The initialized Firebase App instance.
 * @param {Auth} props.auth - The initialized Firebase Auth instance.
 * @param {Firestore} props.firestore - The initialized Firebase Firestore instance.
 * @returns {JSX.Element} The provider component.
 */
export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up the authentication state listener.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup the listener when the component unmounts.
    return () => unsubscribe();
  }, [auth]);

  // Memoize the context value to prevent unnecessary re-renders.
  const contextValue = useMemo(
    () => ({ firebaseApp, auth, firestore, user, isLoading }),
    [firebaseApp, auth, firestore, user, isLoading]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
