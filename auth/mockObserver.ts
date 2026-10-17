import type { RawAuthUser } from "./types"

// --- MOCK DE INFRAESTRUCTURA (Simula el observador sin conexión externa) ---

export class MockAuthObserver {
  private static listeners: ((user: RawAuthUser | null) => void)[] = [];

  // Suscripción al observador simulado
  static subscribeToAuthChanges(onUserChanged: (user: RawAuthUser | null) => void) {
    this.listeners.push(onUserChanged);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== onUserChanged);
    };
  }

  // Disparar evento simulado
  static simulateAuthChange(user: RawAuthUser | null) {
    this.listeners.forEach((listener) => listener(user));
  }
}
