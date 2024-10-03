import { NextResponse } from 'next/server';
import { TELEGRAM_BOT_TOKEN } from '@/lib/telegram';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`);
    const data = await response.json();

    if (data.ok && data.result.photos.length > 0) {
      const fileId = data.result.photos[0][0].file_id;
      const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
      const fileData = await fileResponse.json();

      if (fileData.ok) {
        const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
        return NextResponse.json({ photoUrl });
      }
    }

    return NextResponse.json({ photoUrl: null });
  } catch (error) {
    console.error("Error fetching user photo:", error);
    return NextResponse.json({ error: 'Failed to fetch user photo' }, { status: 500 });
  }
}