import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SUPABASE_SERVICE_ROLE!,
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // ✅ Bucket을 인자로 받도록 수정
  async uploadImage(bucket: string, fileName: string, fileBuffer: Buffer) {
    return await this.supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, { upsert: true });
  }

  async deleteImage(bucket: string, fileName: string) {
    return await this.supabase.storage.from(bucket).remove([fileName]);
  }

  getPublicUrl(bucket: string, path: string): string {
    return this.joinUrlParts(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      'storage/v1/object/public',
      bucket,
      path,
    );
  }

  async copyImage(bucket: string, fromPath: string, toPath: string) {
    return await this.supabase.storage.from(bucket).copy(fromPath, toPath);
  }

  private joinUrlParts(...parts: string[]): string {
    return parts
      .map((part) => part.replace(/^\/+|\/+$/g, ''))
      .join('/')
      .replace(/\/{2,}/g, '/');
  }
}

export function extractFilePathFromPublicUrl(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/';
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  const afterMarker = publicUrl.substring(index + marker.length); // bucket/path/to/file.jpg
  const firstSlash = afterMarker.indexOf('/');

  if (firstSlash === -1) return null;

  return afterMarker.substring(firstSlash + 1); // path/to/file.jpg
}
