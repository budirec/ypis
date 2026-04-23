import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
