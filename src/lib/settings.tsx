'use client';

import { createContext, useContext } from 'react';
import type { GlobalSettings } from '@/lib/wp';

const FALLBACK: GlobalSettings = {
  phoneDisplay: '(800) 789-1605',
  phoneHref: 'tel:+18007891605',
  email: 'help@intervention.com',
};

const SettingsContext = createContext<GlobalSettings>(FALLBACK);

export function SettingsProvider({
  value,
  children,
}: {
  value: GlobalSettings;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/** Access phone/email global settings sourced from WordPress. */
export function useSettings(): GlobalSettings {
  return useContext(SettingsContext);
}
