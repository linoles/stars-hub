import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient(cookies());
  const userData = await request.json();

  // Проверка обязательных полей
  if (!userData.tgId || !userData.tgNick) {
    return NextResponse.json(
      { error: 'Missing required fields (tgId, tgNick)' },
      { status: 400 }
    );
  }

  // Проверяем, есть ли пользователь уже в БД
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('tgId', userData.tgId)
    .maybeSingle(); // Используем maybeSingle(), чтобы избежать ошибки, если пользователя нет

  if (existingUser) {
    return NextResponse.json(existingUser); // Возвращаем существующего пользователя
  }

  // Добавляем нового пользователя
  const { data, error } = await supabase
    .from('users')
    .insert({
      tgId: userData.tgId,
      tgUsername: userData.tgUsername,
      tgNick: userData.tgNick,
      stars: userData.stars || 0, // Дефолтное значение
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}