import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,        // data stays fresh for 5 minutes
            gcTime: 1000 * 60 * 30,          // cache kept for 30 minutes (replaces cacheTime in v5)
            retry: 2,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Thin async adapter around sessionStorage (the API requires Promise-based storage)
const asyncSessionStorage = {
    getItem: (key) => Promise.resolve(window.sessionStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(window.sessionStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(window.sessionStorage.removeItem(key)),
};

// Persist the query cache to sessionStorage so users don't see a loading
// flash when they refresh — cache is cleared automatically when the tab closes.
export const sessionStoragePersister = createAsyncStoragePersister({
    storage: asyncSessionStorage,
});
