import { Repository } from 'typeorm';

abstract class RepositoryType<T> extends Repository<T> {
  [key: string]: any;
}
export type GetRepositoryMethodsArgs<T, S extends keyof RepositoryType<S>> = Parameters<RepositoryType<T>[S]>;
