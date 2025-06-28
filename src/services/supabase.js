import { createClient } from '@supabase/supabase-js'

// Replace these with your actual project details:
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-public-anon-key'  // Use anon/public key, NOT service role key

export const supabase = createClient(supabaseUrl, supabaseKey)
