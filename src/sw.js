import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

// Precache app shell (injected by vite-plugin-pwa at build time)
precacheAndRoute(self.__WB_MANIFEST);

// Network-only for Supabase API calls — never cache sensitive data
registerRoute(
    ({ url }) => url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in'),
    new NetworkOnly()
);

// Activate immediately on install
self.skipWaiting();

// Claim all clients immediately so the SW controls the page right away
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
