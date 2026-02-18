import React from 'react';
import { Calendar, Scissors, Settings, ChevronLeft, LogOut, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { NavLink } from 'react-router-dom';

export function Sidebar({ isCollapsed, toggleSidebar }) {
    const { user, signOut } = useAuth();

    return (
        <aside
            className={cn(
                "relative flex flex-col h-full bg-[#0F0F13] text-zinc-300 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-r border-zinc-800/50 shadow-2xl z-50",
                isCollapsed ? "w-[88px]" : "w-[280px]"
            )}
            style={{
                backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(30,30,35,0.4) 0%, transparent 50%)'
            }}
        >
            {/* Header / Brand */}
            <div className={cn(
                "h-24 flex items-center transition-all duration-500",
                isCollapsed ? "justify-center px-0" : "px-8 justify-between"
            )}>
                {isCollapsed ? (
                    <button
                        onClick={toggleSidebar}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300"
                    >
                        <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 group-hover:from-indigo-400 group-hover:to-white transition-all duration-300">D</span>
                        <div className="absolute inset-0 rounded-xl bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300" />
                    </button>
                ) : (
                    <>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
                                Dember
                                <span className="text-indigo-500">.</span>
                            </h1>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mt-1">Barber Ops</span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300 group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </>
                )}
            </div>

            {/* Navigation Divider */}
            <div className={cn("px-6 mb-4 transition-opacity duration-300", isCollapsed ? "opacity-0 h-0" : "opacity-100")}>
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent w-full" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-3 py-4 overflow-y-auto overflow-x-hidden scrollbar-none">
                <NavItem
                    to="/agenda"
                    icon={Calendar}
                    label="Agenda"
                    isCollapsed={isCollapsed}
                    description="Gestión diaria"
                />

                <NavItem
                    to="/services"
                    icon={Scissors}
                    label="Servicios"
                    isCollapsed={isCollapsed}
                    description="Catálogo"
                />

                <NavItem
                    to="/config"
                    icon={Settings}
                    label="Admin"
                    isCollapsed={isCollapsed}
                    description="Configuración"
                />
            </nav>

            {/* Logout Footer */}
            <div className={cn(
                "mt-auto border-t border-zinc-800/50 p-4 transition-all duration-300",
                isCollapsed ? "flex justify-center" : ""
            )}>
                <button
                    onClick={signOut}
                    className={cn(
                        "group flex items-center gap-3 w-full rounded-xl transition-all duration-300",
                        "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10",
                        isCollapsed
                            ? "justify-center w-10 h-10 p-0"
                            : "px-4 py-3"
                    )}
                    title="Cerrar sesión"
                >
                    <LogOut
                        size={20}
                        className={cn(
                            "transition-transform duration-300",
                            !isCollapsed && "group-hover:-translate-x-1"
                        )}
                    />

                    {!isCollapsed && (
                        <span className="font-semibold text-sm tracking-wide">
                            Cerrar sesión
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}

function NavItem({ icon: Icon, label, to, isCollapsed, description }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "group relative flex items-center transition-all duration-300 ease-out overflow-hidden",
                isCollapsed ? "justify-center p-0 w-12 h-12 mx-auto rounded-2xl" : "px-4 py-3.5 rounded-xl w-full",
                isActive
                    ? "bg-gradient-to-r from-zinc-800/80 to-zinc-900/20 border border-zinc-700/50 shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]"
                    : "hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800/50"
            )}
        >
            {({ isActive }) => (
                <>
                    {/* Active "Blade" Indicator (Left) */}
                    {!isCollapsed && isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-in fade-in slide-in-from-left-2 duration-300" />
                    )}

                    {/* Icon Container */}
                    <div className={cn(
                        "relative flex items-center justify-center transition-all duration-300 z-10",
                        isCollapsed ? "w-full h-full" : "mr-4"
                    )}>
                        <Icon
                            size={isCollapsed ? 22 : 20}
                            strokeWidth={isActive ? 2.5 : 2}
                            className={cn(
                                "transition-all duration-300",
                                isActive
                                    ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                    : "text-zinc-500 group-hover:text-zinc-300"
                            )}
                        />

                        {/* Collapsed Active Dot */}
                        {isCollapsed && isActive && (
                            <div className="absolute bottom-2 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        )}
                    </div>

                    {/* Text Content (Expanded Only) */}
                    {!isCollapsed && (
                        <div className="flex flex-col z-10">
                            <span className={cn(
                                "text-sm font-bold tracking-wide transition-colors duration-300 leading-none",
                                isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                            )}>
                                {label}
                            </span>
                            {description && (
                                <span className={cn(
                                    "text-[10px] font-medium tracking-wider uppercase mt-1 transition-colors duration-300",
                                    isActive ? "text-indigo-500/80" : "text-zinc-600 group-hover:text-zinc-500"
                                )}>
                                    {description}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Hover Glow Effect */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                        isActive && "opacity-0" // Hide raw hover if active
                    )} />
                </>
            )}
        </NavLink>
    );
}
