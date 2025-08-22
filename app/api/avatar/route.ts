import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get('filePath');
  const userId = searchParams.get('userId');

  if (!filePath && !userId) {
    return NextResponse.json({ error: 'File path or user ID is required' }, { status: 400 });
  }

  try {
    let actualFilePath = filePath;

    // Если передан userId, но не filePath, получаем filePath через бота
    if (userId && !filePath) {
      const botResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/bot?action=getAvatar&userId=${userId}`);
      const botData = await botResponse.json();
      
      if (!botData.success) {
        throw new Error(botData.error || 'Failed to get avatar info');
      }
      actualFilePath = botData.filePath;
    }

    // Проксируем изображение от Telegram
    const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${actualFilePath}`;
    const imageResponse = await fetch(telegramFileUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from Telegram');
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Кэш на 24 часа
        'CDN-Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error: any) {
    console.error('Avatar proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to load avatar',
      details: error.message 
    }, { status: 500 });
  }
}