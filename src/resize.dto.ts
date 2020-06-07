/* eslint-disable no-magic-numbers */
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator'
import 'reflect-metadata'
import { GravityEnum } from 'sharp'
import { format } from './interfaces'

export class ResizeDto {
  @IsOptional()
  @IsIn(['heic', 'heif', 'jpeg', 'jpg', 'png', 'raw', 'tiff', 'webp'])
  @IsString()
  public format?: format

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
  public gravity?: keyof GravityEnum

  @IsUrl({ require_host: false, require_tld: false })
  public url?: string
}
