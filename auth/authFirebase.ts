import { onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider, signInWithPopup, signOut } from "../src/firebase";
import type { RawAuthUser } from "./types";

// --- CAPA DE INFRAESTRUCTURA FIREBASE (Observador y Auth Real) ---

export class FirebaseAuthObserver {
  // Suscribe el callback al estado real de autenticación de Firebase
  static subscribeToAuthChanges(onUserChanged: (user: RawAuthUser | null) => void) {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (!firebaseUser) {
        onUserChanged(null);
        return;
      }

      // Mapea el User de Firebase a un RawAuthUser desacoplado
      const rawUser: RawAuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };

      onUserChanged(rawUser);
    });

    return unsubscribe;
  }

  // Inicio de sesión real con ventana emergente de Google
  static async loginWithGoogle(): Promise<RawAuthUser | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error("Firebase Login Error:", error);
      throw error;
    }
  }

  // Cierre de sesión real en Firebase
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase Logout Error:", error);
      throw error;
    }
  }

  // Obtener el usuario actual síncrono si existe
  static getCurrentUser(): RawAuthUser | null {
    const current = auth.currentUser;
    if (!current) return null;
    return {
      uid: current.uid,
      email: current.email,
      displayName: current.displayName,
      photoURL: current.photoURL
    };
  }
}
