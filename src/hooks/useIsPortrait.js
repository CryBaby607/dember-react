import { useState, useEffect } from 'react';

/**
 * Detects portrait orientation using matchMedia.
 * Portrait = viewport width < 1024px (tablet landscape threshold).
 * Returns true in portrait, false in landscape.
 */
export function useIsPortrait(breakpoint = 1024) {
    const [isPortrait, setIsPortrait] = useState(() => window.innerWidth < breakpoint);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const handler = (e) => setIsPortrait(e.matches);

        // Modern API
        if (mql.addEventListener) {
            mql.addEventListener('change', handler);
        } else {
            mql.addListener(handler);
        }

        // Sync on mount
        setIsPortrait(mql.matches);

        return () => {
            if (mql.removeEventListener) {
                mql.removeEventListener('change', handler);
            } else {
                mql.removeListener(handler);
            }
        };
    }, [breakpoint]);

    return isPortrait;
}
