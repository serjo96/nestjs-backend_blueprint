import { ArgumentMetadata, BadRequestException, Injectable, Logger, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  logger = new Logger('ValidationPipe');

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.error(errors);
      throw new BadRequestException('Validation failed');
    }
    return object;
  }

  private toValidate(metaType: { new (value?: unknown): unknown }): boolean {
    const types: Array<{ new (value?: unknown): unknown }> = [String, Boolean, Number, Array, Object];
    return !types.includes(metaType);
  }
}
