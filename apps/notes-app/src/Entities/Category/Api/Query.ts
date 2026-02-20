import { queryOptions } from '@tanstack/react-query';

import { getCategoryList } from './Get';
import { categoryQueryKey } from './Key';

export const categoryQueryOption = {
	list: () =>
		queryOptions({
			queryKey: categoryQueryKey.list(),
			queryFn: getCategoryList,
		}),
};
