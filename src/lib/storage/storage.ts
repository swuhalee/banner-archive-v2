import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

export const storage = supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
