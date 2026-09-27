'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { logout, refreshSession } from '../../lib/auth';

type Session = { accessToken?: string; ready: boolean; setToken: (token?: string) => void; signOut: () => Promise<void> };
const Context = createContext<Session>({ ready: false, setToken: () => undefined, signOut: async () => undefined });
export function AuthSessionProvider({ children }: { children: React.ReactNode }) { const [accessToken, setAccessToken] = useState<string>(); const [ready, setReady] = useState(false); useEffect(() => { refreshSession().then((r) => setAccessToken(r.accessToken)).catch(() => undefined).finally(() => setReady(true)); }, []); return <Context.Provider value={{ accessToken, ready, setToken: setAccessToken, signOut: async () => { await logout(); setAccessToken(undefined); } }}>{children}</Context.Provider>; }
export const useSession = () => useContext(Context);
