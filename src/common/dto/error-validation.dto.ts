import {ApiProperty} from "@nestjs/swagger";


type ErrorObject = {
  [key: string]: string[];
};

class ValidationErrorDto {
  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({
    example: 400
  })
  statusCode: 400

  @ApiProperty({
    example: {
      email: ['email must be an email'],
      password: ['password must be longer than or equal to 6 characters']
    },
    type: 'object',
  })
  errors: ErrorObject;
}


// Factory for creating DTOs with custom error examples
function createValidationErrorDto(examples: ErrorObject): typeof ValidationErrorDto {
  class CustomValidationErrorDto extends ValidationErrorDto {
    @ApiProperty({
      example: examples,
      type: 'object',
    })
    errors: ErrorObject;
  }

  return CustomValidationErrorDto;
}


export const RegistrationValidationErrorDto = createValidationErrorDto({
  password: ["password too weak"],
  email: ['email must be not empty']
});
