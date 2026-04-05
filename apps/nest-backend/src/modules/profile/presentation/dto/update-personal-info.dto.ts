import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePersonalInfoDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() github?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() cvUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) skills?: string[];
}
