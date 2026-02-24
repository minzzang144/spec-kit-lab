import { useQuery } from '@tanstack/react-query';

import { categoryQueryOption } from '../../Api';

export function useCategoryList() {
	return useQuery(categoryQueryOption.list());
}
