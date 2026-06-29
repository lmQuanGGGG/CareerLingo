import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { text } = await request.json();

    const systemPrompt = `Bạn là một biên dịch viên chuyên nghiệp. Nhiệm vụ của bạn là dịch câu tiếng Anh sang tiếng Việt một cách tự nhiên và chính xác nhất, phù hợp với ngữ cảnh giao tiếp công việc (như khách sạn hoặc IT). Chỉ trả về nội dung dịch, không giải thích gì thêm.`;
    const userQuery = `Dịch câu này: "${text}"`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }

    const result = await response.json();
    const translatedText = result.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ translated: translatedText });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
