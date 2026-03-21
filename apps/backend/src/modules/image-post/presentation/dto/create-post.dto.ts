import { IsString, IsNotEmpty, IsUrl, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false, require_protocol: true })
  url: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2200)
  caption: string;

  @IsOptional()
  @IsString()
  blurDataUrl?: string;
}
