import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { words, industry } = await request.json();

    const systemPrompt = `Bạn là một chuyên gia ngôn ngữ tiếng Anh trong lĩnh vực ${industry}.
Nhiệm vụ của bạn là viết CÂU VÍ DỤ TIẾNG ANH chuyên nghiệp, chuẩn xác và CÂU DỊCH TIẾNG VIỆT tự nhiên nhất cho các từ vựng được cung cấp.
Không dùng câu rập khuôn, hãy đặt từ vựng vào đúng ngữ cảnh thực tế của ${industry}.
Yêu cầu trả về CHỈ BẰNG JSON ARRAY ĐỊNH DẠNG SAU, không kèm markdown hay text thừa:
[
  {
    "word": "từ vựng",
    "eg": "Câu ví dụ tiếng Anh cực kỳ tự nhiên và xịn sò.",
    "eg_vn": "Câu dịch tiếng Việt mượt mà, đúng ngữ cảnh."
  }
]
`;

    const userQuery = `Hãy tạo ví dụ cho các từ sau: ${words.join(', ')}`;
    // Using gemini-3.1-flash-lite as default, but falling back to pro if needed
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error", errorText);
      return NextResponse.json({ error: 'Failed to generate examples', details: errorText }, { status: response.status });
    }

    const result = await response.json();
    const jsonText = result.candidates[0].content.parts[0].text;
    const examplesData = JSON.parse(jsonText);

    return NextResponse.json(examplesData);
  } catch (error) {
    console.error('Example generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
