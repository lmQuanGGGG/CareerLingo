export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') || 'en';

  if (!text) {
    return new Response('Text is required', { status: 400 });
  }

  // Google Translate TTS endpoint (gtx)
  const googleUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${lang}&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(googleUrl);
    if (!response.ok) {
      return new Response('Failed to fetch audio from Google TTS', { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS proxy error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
