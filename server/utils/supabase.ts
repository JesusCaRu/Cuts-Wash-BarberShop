import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://neubfqtvzjohmpnaqmot.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'dummy-key-to-prevent-crash';
export const supabase = createClient(supabaseUrl, supabaseKey);
