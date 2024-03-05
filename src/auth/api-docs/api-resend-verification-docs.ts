import {applyDecorators, HttpStatus} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiParam, ApiResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import {TokenValidationErrorDto} from "~/common/dto/TokenValidationErrorDto";
import {BadResponseDto} from "~/common/dto/response-exception.dto";

export function ApiResendVerificationDocs() {
  return applyDecorators(
    ApiParam({
      name: 'email',
      description: 'Email for resend verification',
      type: 'string',
    }),
    ApiTooManyRequestsResponse({
      description: 'Returns unix time before unlock attempt, if email sent recently',
      type: TokenValidationErrorDto,
    }),
    ApiOkResponse({
      description: 'At success operation returns string "ok"',
      schema: {
        type: 'string',
        example: 'ok'
      },
    }),
    ApiBadRequestResponse({
      description: 'Returns if user not exist or already verified or returns if token expired.',
      type: BadResponseDto
    }),
  );
}
