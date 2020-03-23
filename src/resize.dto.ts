/* eslint-disable no-magic-numbers */
import 'reflect-metadata'

import {
  IsString,
  Min,
  Max,
  IsBoolean,
  IsUrl,
  IsInt,
  IsOptional,
  IsIn,
} from 'class-validator'
import { Gravity } from 'sharp'
import { URL } from 'url'
import { Type, Transform } from 'class-transformer'

export default class ResizeDto {
  @IsOptional()
  @IsIn(['heic', 'heif', 'jpeg', 'jpg', 'png', 'raw', 'tiff', 'webp'])
  @IsString()
  public format?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  public height?: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  public width: number = 500

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  public quality: number = 80

  @Type(() => Boolean)
  @IsBoolean()
  public progressive: boolean = false

  @Type(() => Boolean)
  @IsBoolean()
  public crop: boolean = false

  @IsIn([
    'north',
    'northeast',
    'southeast',
    'south',
    'southwest',
    'west',
    'northwest',
    'east',
    'center',
    'centre',
  ])
  @IsOptional()
  @IsString()
  public gravity?: string

  @Type(() => URL)
  @IsUrl({ require_host: false })
  public url?: URL
}
