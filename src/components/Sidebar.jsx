import React from 'react';
import { Calendar, Scissors, Settings, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

import { NavLink } from 'react-router-dom';

export function Sidebar({ isCollapsed, toggleSidebar }) {
    return (
        <aside
            className={cn(
                "bg-transparent text-white flex flex-col shrink-0 transition-[width] duration-300 ease-in-out relative",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header / Logo / Toggle */}
            <div className={cn("flex items-center h-16 transition-[padding] duration-300", isCollapsed ? "justify-center" : "px-4 justify-between")}>
                {isCollapsed ? (
                    <button
                        onClick={toggleSidebar}
                        className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-900/50 hover:bg-indigo-700 transition-colors"
                        title="Expandir"
                    >
                        <span className="font-bold text-xl">D</span>
                    </button>
                ) : (
                    <>
                        <div className="flex items-center overflow-hidden">
                            <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">Dember</h1>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                            title="Colapsar"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
                <NavItem
                    to="/agenda"
                    icon={<Calendar aria-hidden="true" />}
                    label="Agenda"
                    isCollapsed={isCollapsed}
                />

                <NavItem
                    to="/services"
                    icon={<Scissors aria-hidden="true" />}
                    label="Servicios"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/config"
                    icon={<Settings aria-hidden="true" />}
                    label="Configuración"
                    isCollapsed={isCollapsed}
                />
            </nav>

            {/* User Profile */}
            <div className={cn("border-t border-slate-800 transition-[padding] duration-300", isCollapsed ? "p-3 flex justify-center" : "p-4")}>
                <div className={cn("flex items-center transition-[gap] duration-300", isCollapsed ? "justify-center" : "gap-3")}>
                    <div className="w-9 h-9 min-w-[36px] rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800 shadow-sm relative group cursor-pointer">
                        A
                        {isCollapsed && (
                            <div className="absolute left-10 bottom-0 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Admin (admin@barberops.com)
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <p className="text-sm font-medium truncate max-w-[140px]">Admin</p>
                            <p className="text-xs text-slate-400 truncate max-w-[140px]">admin@barberops.com</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export function NavItem({ icon, label, to, isCollapsed }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex items-center rounded-lg transition-colors duration-200 group relative border-l-[3px]",
                isActive
                    ? "border-indigo-400 bg-indigo-500/10 text-white"
                    : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                isCollapsed
                    ? cn("justify-center px-0 py-3", isActive && "bg-indigo-500/15")
                    : "px-4 py-3 gap-3"
            )}
            title={isCollapsed ? label : undefined}
        >
            {({ isActive }) => (
                <>
                    {React.cloneElement(icon, {
                        size: 20,
                        className: cn(
                            "transition-colors",
                            isActive ? "text-indigo-400" : "group-hover:text-slate-200 text-slate-400"
                        )
                    })}

                    {!isCollapsed && (
                        <span className={cn(
                            "whitespace-nowrap overflow-hidden transition-opacity duration-300 opacity-100",
                            isActive ? "font-semibold" : "font-medium"
                        )}>
                            {label}
                        </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                        <div className="absolute left-14 bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                            {label}
                        </div>
                    )}
                </>
            )}
        </NavLink>
    );
}
