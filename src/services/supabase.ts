import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { StorageService, type SupabaseSettings } from './storage';

let supabaseInstance: SupabaseClient | null = null;

import schema from '../../supabase/schema.sql?raw';
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
    if (key.startsWith('sb_secret_')) return {success:false, message:'Secret keys must never be used in a browser.'};
    if (!url || !key) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }
    try {
      const client = createClient(url, key);
      const { error } = await client.from('system_config').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Even if table doesn't exist yet, reaching Supabase means URL/Key are valid
        if (error.message.includes('relation "system_config" does not exist') || error.code === '42P01') {
          return {
            success: true,
            message: 'Connected to Supabase! (Database tables need creation using schema SQL).',
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
