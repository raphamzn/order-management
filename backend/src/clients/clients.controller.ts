import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { SetAuthorizedTransportsDto } from './dto/set-authorized-transports.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Clientes')
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/authorized-transports')
  setAuthorizedTransports(
    @Param('id') id: string,
    @Body() dto: SetAuthorizedTransportsDto,
  ) {
    return this.service.setAuthorizedTransports(id, dto.transportTypeIds);
  }
}
