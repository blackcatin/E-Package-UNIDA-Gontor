import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ulvavmdimaeojgjubqye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsdmF2bWRpbWFlb2pnanVicXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Njc4MzMsImV4cCI6MjA4MTQ0MzgzM30.JfLtOTqDwn6QEyJDLsthLTGDR9a2xZ09mw_E7ObhhwQ';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);