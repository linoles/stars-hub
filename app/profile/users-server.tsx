import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ClientComponent from '@/app/profile/users-client';

export default async function UsersServer() {
  const supabase = await createClient(cookies());
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  
  return <ClientComponent initialUsers={users || []} />
}
