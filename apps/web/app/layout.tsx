import { AuthSessionProvider } from '../components/auth/auth-session-provider';
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><AuthSessionProvider>{children}</AuthSessionProvider></body></html>}
