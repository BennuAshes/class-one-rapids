type EventHandler<T = any> = (data: T) => void | Promise<void>;

interface EventSubscription {
  unsubscribe(): void;
}

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private isDestroyed = false;

  public emit<T>(event: string, data: T): void {
    if (this.isDestroyed) return;
    
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return;

    // Execute handlers asynchronously to prevent blocking
    Promise.resolve().then(() => {
      eventHandlers.forEach(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`EventBus: Error in handler for ${event}:`, error);
        }
      });
    });
  }

  public on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (this.isDestroyed) {
      throw new Error('EventBus has been destroyed');
    }

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

    return {
      unsubscribe: () => {
        const eventHandlers = this.handlers.get(event);
        if (eventHandlers) {
          eventHandlers.delete(handler);
          if (eventHandlers.size === 0) {
            this.handlers.delete(event);
          }
        }
      }
    };
  }

  public once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const subscription = this.on<T>(event, async (data) => {
      subscription.unsubscribe();
      await handler(data);
    });
    return subscription;
  }

  public off(event: string, handler?: EventHandler): void {
    if (!handler) {
      this.handlers.delete(event);
    } else {
      const eventHandlers = this.handlers.get(event);
      if (eventHandlers) {
        eventHandlers.delete(handler);
        if (eventHandlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    }
  }

  public destroy(): void {
    this.handlers.clear();
    this.isDestroyed = true;
  }

  // Development helper
  public getEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Global instance
export const eventBus = new EventBus();