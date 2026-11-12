import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { StorageService, type SupabaseSettings } from './storage';
import schema from '../../supabase/schema.sql?raw';

let supabaseInstance: SupabaseClient | null = null;

export const SUPABASE_SCHEMA_SQL = schema;

export const SupabaseService = {
  getClient(): SupabaseClient | null {
    if (supabaseInstance) return supabaseInstance;

    const settings = StorageService.getSupabaseSettings();
    if (settings.url && settings.anonKey) {
      try {
        supabaseInstance = createClient(settings.url, settings.anonKey);
        return supabaseInstance;
      } catch (e) {
        console.error('Error creating Supabase client:', e);
      }
    }
    return null;
  },

  resetClient(): void {
    supabaseInstance = null;
  },

  async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    if (!url || !key) {
      return { success: false, message: 'Supabase URL and API Key are required.' };
    }
    try {
      const client = createClient(url, key);
      const { error } = await client.from('system_config').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Even if table doesn't exist yet, reaching Supabase means URL/Key are valid
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          return {
            success: true,
            message: 'Connected to Supabase project! Ready for tables: run the schema SQL in the Supabase SQL Editor to initialize.',
          };
        }
        return { success: false, message: `Connection error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected and verified with Supabase!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Failed to connect: ${msg}` };
    }
  },

  isConfigured(): boolean {
    const settings = StorageService.getSupabaseSettings();
    return Boolean(settings.url && settings.anonKey);
  },

  getSettings(): SupabaseSettings {
    return StorageService.getSupabaseSettings();
  },

  saveSettings(settings: SupabaseSettings): void {
    StorageService.saveSupabaseSettings(settings);
    this.resetClient();
  },
};
