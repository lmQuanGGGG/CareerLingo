import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { vocabList } = await request.json();
    const vocabWords = vocabList.map(v => v.word).join(', ');

    const systemPrompt = `Bạn là một chuyên gia đào tạo nghiệp vụ khách sạn 5 sao quốc tế (Marriott standard) và giáo viên tiếng Anh.
Dựa vào danh sách từ vựng được cung cấp, hãy sáng tạo một bài giảng (Lesson) chuyên nghiệp và sát thực tế.
Yêu cầu trả về CHỈ BẰNG JSON ĐỊNH DẠNG SAU, không kèm markdown hay giải thích:
{
  "dialogue": [
    { "speaker": "Receptionist", "text": "..." },
    { "speaker": "Guest", "text": "..." }
  ],
  "listening": {
    "question": "Câu hỏi trắc nghiệm tiếng Anh về nội dung hội thoại?",
    "options": ["đáp án 1", "đáp án 2", "đáp án 3", "đáp án 4"],
    "answer": "đáp án đúng",
    "blankSentence": "Một câu tiếng Anh trích từ hội thoại, có chứa 1 từ vựng bị thay bằng [blank].",
    "blankAnswer": "từ vựng đúng",
    "scrambled": ["từ", "lộn", "xộn", "của", "một", "câu", "khác", "trong", "hội thoại", "."],
    "scrambledAnswer": "Câu hoàn chỉnh đúng ngữ pháp"
  },
  "speaking": [
    {
      "prompt": "Câu tiếng Anh giao tiếp 1 (Dễ)",
      "translation": "Dịch nghĩa 1"
    },
    {
      "prompt": "Câu tiếng Anh giao tiếp 2 (Dễ)",
      "translation": "Dịch nghĩa 2"
    },
    {
      "prompt": "Câu tiếng Anh giao tiếp 3 (Vừa)",
      "translation": "Dịch nghĩa 3"
    },
    {
      "prompt": "Câu tiếng Anh giao tiếp 4 (Khó)",
      "translation": "Dịch nghĩa 4"
    },
    {
      "prompt": "Câu tiếng Anh giao tiếp 5 (Khó nhất - Xử lý tình huống VIP)",
      "translation": "Dịch nghĩa 5"
    }
  ],
  "quiz": [
    {
      "q": "Tình huống: [Mô tả một tình huống thực tế tại khách sạn 5 sao có chứa ngữ cảnh của 1 từ vựng trong danh sách]. Bạn sẽ sử dụng từ tiếng Anh nào sau đây?",
      "a": "Từ tiếng Anh đúng",
      "options": ["Từ đúng", "Từ sai 1", "Từ sai 2", "Từ sai 3"]
    },
    {
      "q": "Điền từ vào chỗ trống: [Một câu tiếng Anh nói bởi nhân viên khách sạn, chừa 1 khoảng trống].",
      "a": "Từ tiếng Anh đúng",
      "options": ["Từ đúng", "Từ sai 1", "Từ sai 2", "Từ sai 3"]
    }
  ]
}

Quy định:
- Hội thoại (dialogue) phải có ít nhất 4-6 câu, lồng ghép tự nhiên ít nhất 3-5 từ vựng trong danh sách. Ngữ cảnh: Khách sạn 5 sao sang trọng.
- Phần listening.options và quiz.options phải có đúng 4 đáp án.
- Mảng quiz phải có ĐÚNG 10 câu hỏi (trộn lẫn giữa câu hỏi tình huống tiếng Việt và điền từ tiếng Anh). KHÔNG hỏi nghĩa từ đơn thuần.
- Đảm bảo tính logic, chuyên nghiệp, tiếng Anh chuẩn bản xứ.`;

    const userQuery = `Hãy tạo JSON bài giảng sử dụng các từ vựng sau: ${vocabWords}`;
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
      return NextResponse.json({ error: 'Failed to generate lesson' }, { status: 500 });
    }

    const result = await response.json();
    const jsonText = result.candidates[0].content.parts[0].text;
    const lessonData = JSON.parse(jsonText);

    return NextResponse.json(lessonData);
  } catch (error) {
    console.error('Lesson generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
