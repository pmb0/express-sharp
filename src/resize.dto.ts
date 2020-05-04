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
import { GravityEnum } from 'sharp'
import { URL } from 'url'
import { Type } from 'class-transformer'
import { format } from './interfaces'

export default class ResizeDto {
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

  @Type(() => URL)
  @IsUrl({ require_host: false })
  public url?: URL
}
