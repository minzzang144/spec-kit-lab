import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

type QueryProviderProps = {
	readonly children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
