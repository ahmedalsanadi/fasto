import {
    QueryClient,
    defaultShouldDehydrateQuery,
} from '@tanstack/react-query';

export const getQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
            dehydrate: {
                // per default, only successful queries are dehydrated,
                // this can be configured (e.g. to dehydrate failed queries as well)
                shouldDehydrateQuery: (query) =>
                    defaultShouldDehydrateQuery(query) ||
                    query.state.status === 'pending',
            },
        },
    });
