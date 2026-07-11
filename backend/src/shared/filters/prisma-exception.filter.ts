import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const STATUS_BY_CODE: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'Registro já existente (violação de unicidade)' },
  P2003: { status: 422, message: 'Referência inválida para um registro relacionado' },
  P2025: { status: 404, message: 'Registro não encontrado' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = STATUS_BY_CODE[exception.code] ?? {
      status: 400,
      message: 'Erro ao processar a operação no banco de dados',
    };

    const target = (exception.meta?.target as string[] | undefined)?.join(', ');

    response.status(mapped.status).json({
      statusCode: mapped.status,
      code: exception.code,
      message: target ? `${mapped.message}: ${target}` : mapped.message,
    });
  }
}
