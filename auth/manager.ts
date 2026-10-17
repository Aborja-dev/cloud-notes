import { FirebaseAuthObserver } from "./authFirebase";
import { MockAuthObserver } from "./mockObserver";
import { ProcessSessionPipeline } from "./pipeline";
import type { RawAuthUser, SessionContext } from "./types";

export type AuthSource = "firebase" | "mock";

// --- MANAGER (Orquestador y Gobierno de Autenticación) ---

export class AuthManager {
  private static unsubscribeFirebase: (() => void) | null = null;
  private static unsubscribeMock: (() => void) | null = null;
  private static activeSource: AuthSource = "firebase";

  // Inicializa la suscripción del observador seleccionado y conecta con el pipeline
  static initialize(
    onStateUpdated: (session: SessionContext | null) => void,
    source: AuthSource = "firebase"
  ) {
    this.stop();
    this.activeSource = source;

    if (source === "firebase") {
      this.unsubscribeFirebase = FirebaseAuthObserver.subscribeToAuthChanges(async (rawUser) => {
        const sessionContext = await ProcessSessionPipeline.execute(rawUser);
        onStateUpdated(sessionContext);
      });
    } else {
      this.unsubscribeMock = MockAuthObserver.subscribeToAuthChanges(async (rawUser) => {
        const sessionContext = await ProcessSessionPipeline.execute(rawUser);
        onStateUpdated(sessionContext);
      });
    }
  }

  // Iniciar sesión con Google (Firebase real)
  static async loginWithGoogle(): Promise<SessionContext | null> {
    const rawUser = await FirebaseAuthObserver.loginWithGoogle();
    return ProcessSessionPipeline.execute(rawUser);
  }

  // Cerrar sesión
  static async logout(): Promise<void> {
    if (this.activeSource === "firebase") {
      await FirebaseAuthObserver.logout();
    } else {
      MockAuthObserver.simulateAuthChange(null);
    }
  }

  // Simular inicio de sesión local para pruebas o modo mock
  static async simulateMockLogin(user: RawAuthUser): Promise<SessionContext | null> {
    MockAuthObserver.simulateAuthChange(user);
    return ProcessSessionPipeline.execute(user);
  }

  // Detener y limpiar los escuchadores
  static stop() {
    if (this.unsubscribeFirebase) {
      this.unsubscribeFirebase();
      this.unsubscribeFirebase = null;
    }
    if (this.unsubscribeMock) {
      this.unsubscribeMock();
      this.unsubscribeMock = null;
    }
  }
}
