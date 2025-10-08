
export type AppUser = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  creationTime?: string;
};

export type UserWithRole = AppUser & {
  isAdmin: boolean;
};
