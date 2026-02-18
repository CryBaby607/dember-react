import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Login() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('dember@barber.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(email, password);
        } catch (err) {
            setError(
                err.message === 'Invalid login credentials'
                    ? 'Credenciales inválidas. Verifica tu email y contraseña.'
                    : 'Error al iniciar sesión. Intenta de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0F0F13] text-zinc-300 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(30,30,35,0.8)_0%,_rgba(15,15,19,1)_80%)]" />
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-md mx-4 z-10 p-6">
                {/* Logo & Header */}
                <div className="text-center mb-10">


                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none mb-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        Dember<span className="text-indigo-500">.</span>
                    </h1>
                    <p className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 uppercase">
                        Barber Ops System
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-1">Bienvenido</h2>
                        <p className="text-sm text-zinc-500">Ingresa tus credenciales para acceder.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    autoComplete="email"
                                    autoFocus
                                    className={cn(
                                        "w-full px-4 py-3 bg-zinc-950/50 border rounded-xl text-zinc-200 placeholder-zinc-600",
                                        "focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50",
                                        "transition-all duration-300",
                                        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
                                        error ? "border-red-500/30 focus:border-red-500/50" : "border-zinc-800 group-hover:border-zinc-700"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className={cn(
                                        "w-full px-4 py-3 bg-zinc-950/50 border rounded-xl text-zinc-200 placeholder-zinc-600",
                                        "focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50",
                                        "transition-all duration-300",
                                        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
                                        error ? "border-red-500/30 focus:border-red-500/50" : "border-zinc-800 group-hover:border-zinc-700"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                <p className="text-sm text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide uppercase",
                                "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/20",
                                "hover:shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-600",
                                "active:scale-[0.98]",
                                "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900",
                                "transition-all duration-300",
                                "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                            ) : (
                                <LogIn className="w-5 h-5" />
                            )}
                            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-4">
                    <div className="flex items-center justify-center gap-4 opacity-30">
                        <div className="h-px w-8 bg-zinc-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        <div className="h-px w-8 bg-zinc-500" />
                    </div>
                    <p className="text-xs font-medium text-zinc-600">
                        Acceso restringido para personal autorizado
                    </p>
                </div>
            </div>
        </div>
    );
}
