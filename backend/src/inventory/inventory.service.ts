import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventoryItem.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { transactions: true },
    });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async create(createInventoryItemDto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: createInventoryItemDto,
    });
  }

  async addTransaction(id: string, createTransactionDto: CreateTransactionDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id } });
      if (!item) throw new NotFoundException(`Inventory item ${id} not found`);

      let quantityChange = createTransactionDto.quantity;
      if (createTransactionDto.type === TransactionType.OUT) {
        quantityChange = -createTransactionDto.quantity;
      } else if (createTransactionDto.type === TransactionType.ADJUSTMENT) {
        quantityChange = createTransactionDto.quantity;
      }

      if (item.quantity + quantityChange < 0) {
        throw new BadRequestException('Transaction would result in negative inventory quantity');
      }

      const transaction = await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: id,
          type: createTransactionDto.type,
          quantity: createTransactionDto.quantity,
          notes: createTransactionDto.notes,
          userId: userId,
        },
      });

      await tx.inventoryItem.update({
        where: { id },
        data: {
          quantity: {
            increment: quantityChange,
          },
        },
      });

      return transaction;
    });
  }
}
