import { useQuery } from '@tanstack/react-query';
import { categoryQueryOption } from '../../Api/Query';

export function useCategoryList() {
  return useQuery(categoryQueryOption.list());
}
