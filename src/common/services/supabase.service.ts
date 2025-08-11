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

  /*

  // ✅ Bucket을 인자로 받도록 수정
  async uploadImage(bucket: string, fileName: string, fileBuffer: Buffer) {
    return await this.supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, { upsert: true });
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

  */

  async deleteImage(bucket: string, fileName: string) {
    return await this.supabase.storage.from(bucket).remove([fileName]);
  }

  async getSignedUploadUrl(bucket: string, filePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);
    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async getSignedUrl(bucket: string, filePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 12, { download: false }); // 12 hour expiration
    if (error) {
      throw new Error(`Failed to create signed download URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}

/*
export function extractFilePathFromPublicUrl(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/';
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  const afterMarker = publicUrl.substring(index + marker.length); // bucket/path/to/file.jpg
  const firstSlash = afterMarker.indexOf('/');

  if (firstSlash === -1) return null;

  return afterMarker.substring(firstSlash + 1); // path/to/file.jpg
}
*/
