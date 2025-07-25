import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Instruments() {
  const supabase = await createClient(cookies());
  const { data: users } = await supabase.from("users").select();
  return <pre>{JSON.stringify(users, null, 2)}</pre>
}
