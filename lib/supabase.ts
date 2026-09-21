import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nbbibmtuzmmnalwctrrz.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_W5-dsdikSiL2YkOZJEeoVw_mkA9TN6T";

export const supabase = createClient(supabaseUrl, supabaseKey);