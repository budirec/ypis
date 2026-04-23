import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ItemType } from '@prisma/client';

export class CreateInventoryItemDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsEnum(ItemType)
  type: ItemType;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;
}
