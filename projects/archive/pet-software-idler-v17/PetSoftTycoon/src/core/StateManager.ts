import { observable, computed, enableReactUse } from '@legendapp/state';

// Enable React hooks
enableReactUse();

// Base service class for all features
export abstract class BaseService {
  protected abstract _state$: any;
  
  // Helper for safe state access
  protected peek<T>(selector: () => T): T {
    return selector();
  }

  // Helper for state updates
  protected update<T>(updater: () => void): void {
    updater();
  }

  // Cleanup method for service destruction
  public destroy(): void {
    // Override in subclasses if needed
  }
}

// Service registry for dependency injection
class ServiceRegistry {
  private services = new Map<string, any>();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service;
  }
  
  clear(): void {
    // Destroy all services
    this.services.forEach(service => {
      if (service.destroy) service.destroy();
    });
    this.services.clear();
  }
}

export const serviceRegistry = new ServiceRegistry();

// Helper for creating observable stores
export function createStore<T>(initialState: T) {
  return observable(initialState);
}

// Helper for creating computed values
export function createComputed<T>(computation: () => T) {
  return computed(computation);
}