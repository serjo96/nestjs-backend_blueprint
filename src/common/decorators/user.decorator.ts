import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((mappedFields: string | string[], ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  let resp = request.user;
  if (mappedFields) {
    resp = {};
    if (Array.isArray(mappedFields)) {
      mappedFields.forEach((field) => {
        resp[field] = request.user[field];
      });
    } else {
      resp = request.user[mappedFields];
    }
  }
  console.log(resp);
  return resp;
});
