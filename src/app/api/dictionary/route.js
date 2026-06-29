import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { word } = await request.json();

    const systemPrompt = `Bạn là một từ điển song ngữ Anh-Việt và Việt-Anh chuyên nghiệp, đồng thời là một công cụ dịch thuật văn bản.
Hãy tự động nhận diện ngôn ngữ của văn bản người dùng nhập vào (có thể là một từ, một cụm từ, hoặc một câu hoàn chỉnh):
- Nếu là tiếng Anh, hãy dịch toàn bộ sang tiếng Việt.
- Nếu là tiếng Việt, hãy dịch toàn bộ sang tiếng Anh.

QUAN TRỌNG: Phải dịch chính xác toàn bộ nội dung người dùng nhập vào, KHÔNG ĐƯỢC tự ý rút gọn thành một từ đơn lẻ. Nếu người dùng nhập một câu (VD: "I love you"), phần meaning phải là dịch nghĩa nguyên câu đó (VD: "Tôi yêu bạn").

Trả về đúng định dạng JSON, không kèm markdown \`\`\`json.
Cấu trúc JSON bắt buộc:
{
  "word": "Văn bản gốc tiếng Anh (nếu người dùng nhập tiếng Anh) HOẶC bản dịch sang tiếng Anh (nếu người dùng nhập tiếng Việt)",
  "ipa": "Phiên âm quốc tế IPA của phần tiếng Anh (nếu là câu dài có thể bỏ trống phần này)",
  "meaning": "BẢN DỊCH TIẾNG VIỆT CHÍNH XÁC của toàn bộ từ/cụm từ/câu đó. Nếu chỉ là 1 từ đơn, có thể thêm loại từ (VD: 'sách (n)').",
  "examples": ["ví dụ song ngữ 1 (Anh - Việt)", "ví dụ song ngữ 2 (Anh - Việt)"]
}`;
    const userQuery = `Tra từ này: "${word}"`;

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
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: 'Failed to look up word', details: errorText }, { status: 500 });
    }

    const result = await response.json();
    let textResult = result.candidates[0].content.parts[0].text.trim();

    // Clean up potential markdown formatting
    if (textResult.startsWith('```json')) {
      textResult = textResult.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (textResult.startsWith('```')) {
      textResult = textResult.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const dictData = JSON.parse(textResult);

    return NextResponse.json(dictData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
