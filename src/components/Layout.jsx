import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useIsPortrait } from '@/hooks/useIsPortrait';
import { cn } from '@/lib/utils';

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
            {/* Backdrop overlay for portrait expanded sidebar */}
            {isPortrait && !isCollapsed && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar — always in flex flow */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                isPortrait={isPortrait}
            />

            {/* Main Content — pure flex-1, no ml compensation */}
            <main className="flex-1 min-w-0 overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out bg-white m-2 rounded-2xl shadow-sm border border-slate-200">
                {children}
            </main>
        </div>
    );
}
