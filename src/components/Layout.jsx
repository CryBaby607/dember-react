import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }) {
    // Initialize state from localStorage to persist user preference
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved !== null ? saved === 'true' : true;
    });

    // Toggle function
    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', newState);
            return newState;
        });
    };

    return (
        <div className="flex h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
            {/* Sidebar Component */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content */}
            <main
                className="flex-1 overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out bg-slate-50 m-2 rounded-2xl shadow-2xl border border-white/10"
            >
                {children}
            </main>
        </div>
    );
}
