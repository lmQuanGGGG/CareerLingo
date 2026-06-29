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

    const { history, currentInput, persona, difficulty, careerTrack } = await request.json();

    let systemPrompt = '';
    if (careerTrack === 'it') {
      systemPrompt = `Bạn là đối tác/khách hàng/đồng nghiệp trong một dự án Công nghệ thông tin (IT / Software Engineering).
Vai trò của bạn: ${persona}. Độ khó giao tiếp: ${difficulty}.
Nhiệm vụ:
1. Đóng vai ${persona} và trò chuyện tự nhiên bằng tiếng Anh với người dùng (người dùng là Developer/Kỹ sư/Quản lý dự án).
2. Viết câu trả lời của bạn bằng TIẾNG ANH một cách tự nhiên (ngắn gọn 2-3 câu).
3. Đánh giá câu trả lời của người dùng bằng TIẾNG VIỆT trong cặp dấu ngoặc vuông [...].
- Người dùng có hiểu đúng vấn đề kỹ thuật không?
- Người dùng có đưa ra giải pháp hợp lý và chuyên nghiệp không?
- Thái độ giao tiếp có phù hợp với văn hóa IT chuyên nghiệp không?
Hãy nhận xét và chấm điểm nhẹ nhàng trong ngoặc vuông để giúp người dùng rèn luyện kỹ năng giao tiếp tiếng Anh chuyên ngành IT. Ví dụ: [Bạn giải thích vấn đề rất rõ ràng, từ vựng 'deployment' dùng chính xác. Tuy nhiên, thay vì nói 'I don't know', bạn nên dùng 'Let me investigate the logs and get back to you'].
Nếu người dùng làm xuất sắc, hãy khen ngợi.`;
    } else {
      systemPrompt = `Bạn là một vị khách VIP lưu trú tại khách sạn 5 sao quốc tế, nơi tuân thủ nghiêm ngặt tiêu chuẩn dịch vụ kiểu Marriott (Marriott Standards) & nguyên tắc L.E.A.R.N.
Vai trò của bạn: ${persona}. Độ khó giao tiếp: ${difficulty}.
Nhiệm vụ:
1. Đóng vai khách hàng và trò chuyện tự nhiên bằng tiếng Anh với người dùng (người dùng là Lễ tân).
2. Viết câu trả lời của khách bằng TIẾNG ANH một cách tự nhiên (ngắn gọn 2-3 câu).
3. Đánh giá câu trả lời của Lễ tân bằng TIẾNG VIỆT trong cặp dấu ngoặc vuông [...].
- Lễ tân có chào bằng tên khách không? (ví dụ: Mr. Branson)
- Lễ tân có thể hiện sự đồng cảm (Empathy) và xin lỗi nếu khách phàn nàn không?
- Lễ tân có chủ động đề xuất giải pháp thay thế (Anticipate needs) không?
Hãy nhận xét và chấm điểm nhẹ nhàng trong ngoặc vuông để giúp lễ tân rèn luyện nghiệp vụ 5 sao. Ví dụ: [Bạn xử lý rất tốt, đã biết dùng kính ngữ 'Certainly, Sir'. Tuy nhiên theo chuẩn 5 sao, bạn nên offer thêm đồ uống hoặc ghế ngồi khi tôi nói tôi mệt mỏi sau chuyến bay].
Nếu người dùng làm xuất sắc, hãy khen ngợi.`;
    }

    let userQuery = '';
    if (careerTrack === 'it') {
      userQuery = `Lịch sử hội thoại:\n${history}\n\nNgười dùng (Developer) vừa nói: "${currentInput}"\n\nHãy phản hồi tiếp theo bằng tiếng Anh chân thực nhất, kèm nhận xét tiếng Việt trong dấu [...].`;
    } else {
      userQuery = `Lịch sử hội thoại:\n${history}\n\nLễ tân vừa nói: "${currentInput}"\n\nHãy phản hồi tiếp theo bằng tiếng Anh chân thực nhất, kèm nhận xét tiếng Việt trong dấu [...].`;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
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
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Thank you. Your professionalism is truly appreciated. [Hệ thống không nhận được phản hồi từ AI]";

    return NextResponse.json({ text: responseText });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
