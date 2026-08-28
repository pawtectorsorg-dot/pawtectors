import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env relative to this file's directory (backend/src/config/) → project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseClient: SupabaseClient | Record<string, unknown>;
let supabaseAdminClient: SupabaseClient | Record<string, unknown>;
let isUsingMock = false;

// Simple in-memory database mock
const mockDb: Record<string, any[]> = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'System Administrator',
      email: 'admin@pawtectors.com',
      password: 'pawtectors123',
      mobile_number: '9999999999',
      address: 'System Admin Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      preferred_location: 'Mumbai',
      gender: 'other',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Sarah Pet Groomer',
      email: 'sarah@groomers.com',
      password: 'password123',
      mobile_number: '9876543221',
      address: 'Pet Care Center, Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560025',
      preferred_location: 'Bangalore',
      gender: 'female',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      full_name: 'Dr. Amit Veterinary',
      email: 'dr.amit@vetclinic.com',
      password: 'password123',
      mobile_number: '9876543220',
      address: 'Clinic Building, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      preferred_location: 'Mumbai',
      gender: 'male',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  user_roles: [
    {
      profile_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin'
    },
    {
      profile_id: '00000000-0000-0000-0000-000000000002',
      role: 'provider'
    },
    {
      profile_id: '00000000-0000-0000-0000-000000000003',
      role: 'provider'
    }
  ],
  service_providers: [
    {
      id: '00000000-0000-0000-0000-000000000102',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Pawsome Grooming Salon',
      category: 'grooming',
      email: 'sarah@groomers.com',
      phone: '9876543221',
      address: 'Shop 12, Phoenix Mall, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400013',
      is_active: true,
      is_verified: true,
      rating: 4.3,
      review_count: 156,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      user_id: '00000000-0000-0000-0000-000000000003',
      name: 'Mumbai Pet Clinic',
      category: 'clinic',
      email: 'dr.amit@vetclinic.com',
      phone: '022-28501234',
      address: '123 MG Road, Near Railway Station',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      is_active: true,
      is_verified: true,
      rating: 4.5,
      review_count: 245,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]
};

class MockBuilder {
  private tableName: string;
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: any = null;
  private filters: Array<{ column: string; value: any }> = [];
  private isSingle = false;
  private isMaybeSingle = false;
  private columns?: string;
  private options?: any;

  constructor(tableName: string) {
    this.tableName = tableName;
    if (!mockDb[tableName]) {
      mockDb[tableName] = [];
    }
  }

  select(columns?: string, options?: any) {
    this.op = 'select';
    this.columns = columns;
    this.options = options;
    return this;
  }

  insert(values: any) {
    this.op = 'insert';
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.op = 'update';
    this.payload = values;
    return this;
  }

  upsert(values: any) {
    this.op = 'upsert';
    this.payload = values;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  // Fallbacks for other filter/query methods to support chaining
  neq() { return this; }
  gt() { return this; }
  lt() { return this; }
  gte() { return this; }
  lte() { return this; }
  like() { return this; }
  ilike() { return this; }
  is() { return this; }
  in() { return this; }
  order() { return this; }
  limit() { return this; }
  range() { return this; }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const list = mockDb[this.tableName] || [];
    let data: any = null;
    let error: any = null;
    let count: number | null = null;

    try {
      if (this.op === 'select') {
        let results = [...list];
        for (const f of this.filters) {
          results = results.filter(row => row[f.column] === f.value);
        }

        if (this.options && this.options.count) {
          count = results.length;
        }

        if (this.columns === 'count') {
          data = results.length;
        } else if (this.isSingle || this.isMaybeSingle) {
          data = results[0] || null;
        } else {
          data = results;
        }
      } else if (this.op === 'insert') {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        const newRows = items.map(item => ({
          id: item.id || `mock-uuid-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        }));
        list.push(...newRows);
        data = Array.isArray(this.payload) ? newRows : newRows[0];
      } else if (this.op === 'update') {
        mockDb[this.tableName] = list.map(row => {
          let matches = true;
          for (const f of this.filters) {
            if (row[f.column] !== f.value) {
              matches = false;
              break;
            }
          }
          if (matches) {
            return { ...row, ...this.payload, updated_at: new Date().toISOString() };
          }
          return row;
        });

        let results = mockDb[this.tableName];
        for (const f of this.filters) {
          results = results.filter(row => row[f.column] === f.value);
        }
        data = this.isSingle || this.isMaybeSingle ? (results[0] || null) : results;
      } else if (this.op === 'upsert') {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        for (const item of items) {
          const idx = list.findIndex(row => {
            if (item.id && row.id === item.id) return true;
            if (item.email && row.email === item.email) return true;
            if (item.profile_id && row.profile_id === item.profile_id) return true;
            return false;
          });
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...item, updated_at: new Date().toISOString() };
          } else {
            list.push({
              id: item.id || `mock-uuid-${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...item
            });
          }
        }
        data = this.payload;
      } else if (this.op === 'delete') {
        mockDb[this.tableName] = list.filter(row => {
          let matches = true;
          for (const f of this.filters) {
            if (row[f.column] !== f.value) {
              matches = false;
              break;
            }
          }
          return !matches;
        });
        data = null;
      }

      const response = { data, error, count };
      return Promise.resolve(response).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).catch(onrejected);
    }
  }
}

// Try to create Supabase client
try {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
} catch (error) {
  console.warn('⚠️  Supabase initialization failed, using mock database');
  isUsingMock = true;

  const mockClient = {
    from: (table: string) => new MockBuilder(table),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };

  supabaseClient = mockClient;
  supabaseAdminClient = mockClient;
}

export { isUsingMock };
// Export typed clients so callers get proper Supabase typings. When a mock is used
// the runtime value may not satisfy `SupabaseClient`, so we cast here.
export const supabase = supabaseClient as SupabaseClient;
export const supabaseAdmin = supabaseAdminClient as SupabaseClient;

export const getSupabaseClient = (): SupabaseClient => supabaseClient as SupabaseClient;
export const getSupabaseAdminClient = (): SupabaseClient => supabaseAdminClient as SupabaseClient;
