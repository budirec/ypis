import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Post(':id/transaction')
  addTransaction(
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any
  ) {
    const userId = req.user?.id;
    return this.inventoryService.addTransaction(id, createTransactionDto, userId);
  }
}
