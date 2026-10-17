// --- MODELOS Y TIPOS DE AUTENTICACIÓN ---

export interface SessionContext {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  isAuthenticated: boolean;
}

export interface RawAuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
