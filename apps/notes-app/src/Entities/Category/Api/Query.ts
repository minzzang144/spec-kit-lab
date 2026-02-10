import { queryOptions } from '@tanstack/react-query';
import { getCategoryList } from './Get';

export const categoryQueryKey = {
  all: ['category'] as const,
  list: () => [...categoryQueryKey.all, 'list'] as const,
};

export const categoryQueryOption = {
  list: () =>
    queryOptions({
      queryKey: categoryQueryKey.list(),
      queryFn: getCategoryList,
    }),
};
