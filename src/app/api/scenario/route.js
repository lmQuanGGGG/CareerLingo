import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { prompt } = await request.json();

    const systemPrompt = `Bạn là một chuyên gia quản lý khách sạn 5 sao quốc tế (Marriott standard) và giáo viên tiếng Anh.
Người dùng sẽ đưa ra một tình huống hoặc vấn đề khó xử tại khách sạn. Nhiệm vụ của bạn là đưa ra cách giải quyết tinh tế, chuyên nghiệp nhất theo chuẩn 5 sao, kèm theo hội thoại tiếng Anh.
Yêu cầu trả về CHỈ BẰNG JSON ĐỊNH DẠNG SAU, không kèm markdown hay giải thích:
{
  "title": "Tiêu đề ngắn gọn của tình huống (Tiếng Việt)",
  "category": "Chọn 1 trong: Check-in, Check-out, Concierge, Complaint Handling, VIP Service, Emergency",
  "desc": "Tóm tắt ngắn gọn hoàn cảnh tình huống (Tiếng Việt).",
  "dialog": "Đoạn hội thoại tiếng Anh giữa Guest (G:) và Receptionist/Manager (R:) giải quyết vấn đề cực kỳ tinh tế, khéo léo.",
  "vocab": "3 từ vựng hoặc cụm từ tiếng Anh đắt giá nhất trong đoạn hội thoại kèm nghĩa tiếng Việt. (Ví dụ: 'Sincere apologies (Lời xin lỗi chân thành), Rectify (Khắc phục)')"
}
`;

    const userQuery = `Tình huống: ${prompt}`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
      console.error("Gemini API Error", await response.text());
      return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
    }

    const result = await response.json();
    const jsonText = result.candidates[0].content.parts[0].text;
    const scenarioData = JSON.parse(jsonText);

    return NextResponse.json(scenarioData);
  } catch (error) {
    console.error('Scenario generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
