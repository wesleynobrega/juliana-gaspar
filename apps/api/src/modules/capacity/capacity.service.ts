import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type {
  CapacityStatusDTO,
  CreateWaitlistEntryDTO,
  WaitlistEntryDTO,
} from '@juliana-gaspar/contracts';

// ── Mappers ────────────────────────────────────────────

type PrismaWaitlistEntry =
  Awaited<ReturnType<typeof prisma.waitlistEntry.findUnique>>;

function toWaitlistEntryDTO(
  entry: NonNullable<PrismaWaitlistEntry>,
): WaitlistEntryDTO {
  return {
    id: entry.id,
    customerId: entry.customerId,
    cycleId: entry.cycleId,
    position: entry.position,
    status: entry.status as WaitlistEntryDTO['status'],
    createdAt: entry.createdAt.toISOString(),
  };
}

// ── Service ────────────────────────────────────────────

@Injectable()
export class CapacityService {
  /** Retorna status de capacidade de um ciclo */
  async getStatus(cycleId: string): Promise<CapacityStatusDTO> {
    const cycle = await prisma.weeklyCycle.findUnique({
      where: { id: cycleId },
    });
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');

    const confirmedClients = await prisma.order.count({
      where: { cycleId, status: { not: 'CANCELLED' } },
    });

    const waitlistCount = await prisma.waitlistEntry.count({
      where: { cycleId, status: 'WAITING' },
    });

    return {
      cycleId: cycle.id,
      maxClients: cycle.maxClients,
      confirmedClients,
      availableSlots: Math.max(0, cycle.maxClients - confirmedClients),
      isFull: confirmedClients >= cycle.maxClients,
      waitlistCount,
      nextCycleDate: cycle.deliveryDate.toISOString(),
    };
  }

  /** Adiciona cliente à fila de espera */
  async joinWaitlist(dto: CreateWaitlistEntryDTO): Promise<WaitlistEntryDTO> {
    // Verifica se o ciclo existe
    const cycle = await prisma.weeklyCycle.findUnique({
      where: { id: dto.cycleId },
    });
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');

    // Calcula a próxima posição na fila
    const lastEntry = await prisma.waitlistEntry.findFirst({
      where: { cycleId: dto.cycleId },
      orderBy: { position: 'desc' },
    });
    const position = (lastEntry?.position ?? 0) + 1;

    try {
      const entry = await prisma.waitlistEntry.create({
        data: {
          customerId: dto.customerId,
          cycleId: dto.cycleId,
          position,
        },
      });
      return toWaitlistEntryDTO(entry);
    } catch {
      throw new BadRequestException(
        'Cliente já está na lista de espera deste ciclo',
      );
    }
  }

  /** Lista fila de espera de um ciclo */
  async listWaitlist(
    cycleId: string,
  ): Promise<{ data: WaitlistEntryDTO[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.waitlistEntry.findMany({
        where: { cycleId },
        orderBy: { position: 'asc' },
      }),
      prisma.waitlistEntry.count({ where: { cycleId } }),
    ]);
    return {
      data: data.map((e) =>
        toWaitlistEntryDTO(e as NonNullable<PrismaWaitlistEntry>),
      ),
      total,
    };
  }

  /** Remove cliente da fila de espera */
  async removeFromWaitlist(id: string): Promise<void> {
    const existing = await prisma.waitlistEntry.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException('Entrada na fila não encontrada');
    await prisma.waitlistEntry.delete({ where: { id } });
  }
}
