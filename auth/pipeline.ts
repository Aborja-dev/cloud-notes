import type { RawAuthUser, SessionContext } from "./types"

// --- PIPELINE DE PROCESAMIENTO Y TRANSFORMACIÓN DE SESIÓN ---

export class ProcessSessionPipeline {
  static async execute(rawUser: RawAuthUser | null): Promise<SessionContext | null> {
    if (!rawUser || !rawUser.uid) {
      return null;
    }

    // Regla de negocio / Transformación de contexto mínimo
    return {
      uid: rawUser.uid,
      email: rawUser.email ?? "",
      displayName: rawUser.displayName ?? null,
      photoURL: rawUser.photoURL ?? null,
      isAuthenticated: true
    };
  }
}
