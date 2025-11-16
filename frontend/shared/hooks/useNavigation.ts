import { useMemo } from 'react';
import { observable, Observable } from '@legendapp/state';

type Screen = 'clicker' | 'shop';

interface UseNavigationReturn {
  currentScreen$: Observable<Screen>;
  actions: {
    navigateToShop: () => void;
    navigateToClicker: () => void;
    reset: () => void;
  };
}

const currentScreen$ = observable<Screen>('clicker');

/**
 * Hook for managing simple state-based navigation between screens.
 * Uses Legend-State observable for reactive screen switching.
 *
 * @returns Navigation state and actions
 */
export function useNavigation(): UseNavigationReturn {
  const actions = useMemo(
    () => ({
      navigateToShop: () => {
        currentScreen$.set('shop');
      },
      navigateToClicker: () => {
        currentScreen$.set('clicker');
      },
      reset: () => {
        currentScreen$.set('clicker');
      },
    }),
    []
  );

  return useMemo(
    () => ({
      currentScreen$,
      actions,
    }),
    [actions]
  );
}
