import { IsOptional } from 'class-validator';
import { IsOrderDirection } from './decorators/sortValidation';
import { PaginatorQuery } from './paginator';

export class SortBy {
  id = '';
  createdAt = '';
  updatedAt = '';
  deletedAt = '';
}

export class SortWithPaginationQuery extends PaginatorQuery {
  @IsOptional()
  @IsOrderDirection()
  sort_by: string;
}

export default interface ISort {
  order: {
    [key: string]: string;
  };
}

export const sort = (query: SortWithPaginationQuery): ISort => {
  const result: ISort = {
    order: {
      createdAt: 'asc',
    },
  };

  const { sort_by } = query;

  if (sort_by) {
    const [sortType, sortDir] = sort_by.split('.');
    result.order = {};
    result.order[sortType] = sortDir.toUpperCase();
  }

  return result;
};
