import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useIsPortrait } from '@/hooks/useIsPortrait';

export function Layout({ children }) {
    const isPortrait = useIsPortrait(); // true when width < 1024px

    // Initialize state from localStorage to persist user preference
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved !== null ? saved === 'true' : true;
    });

    // In portrait mode, sidebar always starts collapsed
    // When switching TO portrait, force collapse
    useEffect(() => {
        if (isPortrait) {
            setIsCollapsed(true);
        }
    }, [isPortrait]);

    // Toggle function
    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            // Only persist preference in landscape mode
            if (!isPortrait) {
                localStorage.setItem('sidebarCollapsed', newState);
            }
            return newState;
        });
    };

    // Close sidebar overlay when tapping backdrop (portrait only)
    const handleBackdropClick = () => {
        if (isPortrait && !isCollapsed) {
            setIsCollapsed(true);
        }
    };

    return (
        <div className="flex h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
            {/* Backdrop overlay for portrait sidebar */}
            {isPortrait && (
                <div
                    className={`sidebar-backdrop ${!isCollapsed ? 'active' : ''}`}
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Component */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                isPortrait={isPortrait}
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
