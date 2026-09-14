import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global so PrismaService is resolvable as an `inject` dependency inside
// AdminModule.forRootAsync's factory, which runs in AdminModule's own
// injector context rather than AppModule's.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
