import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { SupabaseService } from './services/supabase.service';

@Global()
@Module({
  providers: [PrismaService, SupabaseService],
  exports: [PrismaService, SupabaseService],
})
export class CommonModule {}
