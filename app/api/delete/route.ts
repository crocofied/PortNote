import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated/prisma'; 

const prisma = new PrismaClient();

interface DeleteRequest {
  type: number; // 0: Host Server, 1: VM (Server with host set), 2: Port
  id: number;
}

export async function DELETE(request: NextRequest) {
  try {
    const { type, id }: DeleteRequest = await request.json();

    if (type === 0) {
      // Find all VM IDs belonging to the host server
      const vmRecords = await prisma.server.findMany({
        where: { host: id },
        select: { id: true }
      });
      const vmIds = vmRecords.map(vm => vm.id);

      // Delete all ports of those VMs
      if (vmIds.length > 0) {
        await prisma.port.deleteMany({
          where: { serverId: { in: vmIds } }
        });
      }

      // Delete ports belonging directly to the host server itself
      await prisma.port.deleteMany({
        where: { serverId: id }
      });

      // Delete all VM records
      await prisma.server.deleteMany({ where: { host: id } });

      // Finally delete the host server
      await prisma.server.delete({ where: { id } });

    } else if (type === 1) {
      // VM: delete ports then the VM (represented as a server record with host set)
      await prisma.port.deleteMany({ where: { serverId: id } });
      await prisma.server.delete({ where: { id } });

    } else if (type === 2) {
      // Port: delete a single port
      await prisma.port.delete({ where: { id } });

    } else {
      return NextResponse.json({ error: 'Invalid delete type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}