import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chưa cấu hình GEMINI_API_KEY trong file .env.local' },
        { status: 500 }
      );
    }

    const { persona, difficulty, careerTrack } = await request.json();

    let systemPrompt = '';
    if (careerTrack === 'it') {
      systemPrompt = `Bạn là đối tác/khách hàng/đồng nghiệp trong một dự án Công nghệ thông tin (IT / Software Engineering).
Vai trò của bạn: ${persona}. Độ khó giao tiếp dự kiến: ${difficulty}.
Nhiệm vụ:
Hãy tạo ra MỘT câu mở đầu (opening line) hoàn toàn mới, sáng tạo cho kịch bản giao tiếp IT (Code Review, Bug Fixing, Client Meeting, Sprint Planning, System Outage, Technical Support, v.v).
Câu mở đầu phải bằng TIẾNG ANH (ngắn gọn 2-3 câu).
KHÔNG bao gồm bất kỳ lời giải thích hay ngoặc kép nào, CHỈ trả về đúng lời thoại của bạn.
Hãy sáng tạo các tình huống khác nhau: hối thúc deadline, giận dữ vì lỗi hệ thống, thắc mắc về tính năng, v.v...`;
    } else {
      systemPrompt = `Bạn là một vị khách lưu trú tại khách sạn 5 sao quốc tế.
Vai trò của bạn: ${persona}. Độ khó giao tiếp dự kiến: ${difficulty}.
Nhiệm vụ:
Hãy tạo ra MỘT câu mở đầu (opening line) hoàn toàn mới, sáng tạo cho kịch bản khách sạn (check-in, phàn nàn, yêu cầu đặc biệt, v.v).
Câu mở đầu phải bằng TIẾNG ANH (ngắn gọn 2-3 câu).
KHÔNG bao gồm bất kỳ lời giải thích hay ngoặc kép nào, CHỈ trả về đúng lời thoại của khách.
Hãy sáng tạo các tình huống khác nhau: mệt mỏi, tức giận, vui vẻ, đòi hỏi khắt khe, đi cùng gia đình, v.v...`;
    }

    const userQuery = `Hãy bắt đầu kịch bản ngay bây giờ.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.9,
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return NextResponse.json({ error: 'Gemini API call failed.' }, { status: 500 });
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Hello. I need to check in right away.";

    return NextResponse.json({ text: responseText.trim() });

  } catch (error) {
    console.error('Roleplay Starter API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
