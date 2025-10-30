import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wogdmkrfvlrftllgtxsa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZ2Rta3JmdmxyZnRsbGd0eHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDAwOTcsImV4cCI6MjA3MjExNjA5N30.lXeURFA_b_UjW0T4E-46bM3vaAqSSVpRXJc_qtsk-Ss';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);