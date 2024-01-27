import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export function IsOrderDirection(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isSortQuery',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [sortType, direction] = value.split('.');
          const sortDirection = ['asc', 'desc'];
          return sortDirection.includes(direction); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
        defaultMessage: () => 'Sort direction must be only "asc" or "desc"',
      },
    });
  };
}

export function IsOrderBy<T>(property: T, validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isSortQuery',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const [sortType] = value.split('.');
          return sortType in relatedPropertyName; // you can return a Promise<boolean> here as well, if you want to make async validation
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const keys = Object.keys(relatedPropertyName);
          return `OrderBy must be includes some of "${keys}"`;
        },
      },
    });
  };
}
