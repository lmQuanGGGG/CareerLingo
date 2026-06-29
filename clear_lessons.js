import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function clear() {
  const { data, error } = await supabase
    .from('user_progress')
    .update({ ai_lessons: {} })
    .neq('id', 'dummy'); // match all
  
  if (error) console.error(error);
  else console.log('Successfully cleared ai_lessons for all users');
}
clear();
