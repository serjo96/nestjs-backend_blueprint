import {OmitType} from '@nestjs/swagger';
import {Profile} from "@user/profiles.entity";

export class ProfileDto extends OmitType(Profile, ['user', 'id'] as const) {}
export class ProfileResponseDto extends OmitType(Profile, ['user'] as const) {}

