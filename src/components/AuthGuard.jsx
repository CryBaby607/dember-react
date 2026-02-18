import { useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-sm text-slate-400">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return children;
}
