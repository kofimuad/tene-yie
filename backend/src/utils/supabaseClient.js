// src/utils/supabaseClient.js
// This file connects to Supabase and exports a client we use everywhere

// Import Supabase client library
import { createClient } from '@supabase/supabase-js';

// Create and export a Supabase client instance
// Think of this like connecting to a database - we do it once and reuse it
const supabase = createClient(
  process.env.SUPABASE_URL,      // Your Supabase project URL
  process.env.SUPABASE_KEY       // Your Supabase anonymous key
);

export default supabase;

// ========== HOW TO USE THIS ==========
// In any file, import like this:
// const supabase = require('../utils/supabaseClient');
// 
// Then query the database:
// const { data, error } = await supabase
//   .from('workflows')           // table name
//   .select('*')                 // select all columns
//   .eq('id', workflowId);       // where id equals workflowId