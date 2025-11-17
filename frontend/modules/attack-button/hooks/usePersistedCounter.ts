import { useMemo } from 'react';
import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Observable } from '@legendapp/state';

interface UsePersistedCounterReturn {
  count$: Observable<number>;
  actions: {
    increment: () => void;
    reset: () => void;
  };
}

/**
 * Custom hook providing persistent counter behavior using Legend-State.
 *
 * Behavior: Incremental counting with automatic AsyncStorage persistence
 *
 * @param storageKey - Unique key for AsyncStorage persistence
 * @returns Observable counter and increment action
 *
 * @example
 * const { count$, actions } = usePersistedCounter('my-counter');
 *
 * // In component:
 * <Memo>{() => <Text>Count: {count$.get()}</Text>}</Memo>
 * <Pressable onPress={actions.increment}>
 *   <Text>Increment</Text>
 * </Pressable>
 */
export function usePersistedCounter(storageKey: string): UsePersistedCounterReturn {
  return useMemo(() => {
    const count$ = observable(
      synced({
        initial: 0,
        persist: {
          name: storageKey,
          plugin: new ObservablePersistAsyncStorage({ AsyncStorage }),
        },
      })
    );

    const actions = {
      increment: () => {
        count$.set(count$.get() + 1);
      },
      reset: () => {
        count$.set(0);
      },
    };

    return { count$, actions };
  }, [storageKey]);
}
