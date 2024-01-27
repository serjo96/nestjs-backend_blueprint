import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import validateBoolean from "~/utils/validateBoolean";

export class PaginatorQuery {
  @IsOptional()
  @Transform((value) => (validateBoolean(value)))
  @IsBoolean({
    message: '"all" must be "true" or "false"',
  })
  all?: boolean;

  @IsOptional()
  @Transform((value) => (Number(value) ? Number(value) : value))
  @IsInt({
    message: 'The number of objects requested must be an integer',
  })
  @Min(0, {
    message: 'The number of requested objects cannot be less than zero',
  })
  count?: number;

  @IsOptional()
  @Transform((value) => (Number(value) ? Number(value) : value))
  @IsInt({
    message: 'The offset number of the object must be integer',
  })
  @Min(0, {
    message: 'The offset number of an object cannot be less than zero',
  })
  offset?: number;
}

export interface IPaginatorType {
  skip?: number | null;
  take?: number | null;
}

export const paginator = (value: PaginatorQuery): IPaginatorType => {
  const result: IPaginatorType = {};

  const { all, count, offset } = value;

  if (offset) {
    result.skip = offset;
  }

  if (count) {
    result.take = count;
  }

  if (all) {
    result.take = null;
    result.skip = null;
  }

  return result;
};
