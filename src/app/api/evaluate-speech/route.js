import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userInput, targetPrompt } = await req.json();

    if (!userInput) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = `
Bạn là một chuyên gia đào tạo Lễ tân Khách sạn 5 sao quốc tế (chuẩn JW Marriott, Park Hyatt).
Học viên vừa thực hành luyện nói để xử lý tình huống: "${targetPrompt}"
Câu học viên đã nói là: "${userInput}"

Hãy đánh giá câu nói của học viên dựa trên các tiêu chí:
1. Mức độ chuyên nghiệp và lịch sự (Diplomatic language).
2. Từ vựng có thuộc bộ từ vựng cao cấp ngành khách sạn không.
3. Ngữ pháp và ngữ nghĩa.

Trả về kết quả TẤT CẢ DƯỚI DẠNG JSON với cấu trúc chính xác như sau (KHÔNG thêm markdown \`\`\`json hay text dư thừa):
{
  "score": <Điểm số từ 0 đến 100, dựa trên độ xịn và chuẩn xác>,
  "feedback": "<Một đoạn nhận xét ngắn gọn gọn bằng tiếng Việt (khoảng 2-3 câu), chỉ ra điểm tốt và điểm cần cải thiện>",
  "better_version": "<Gợi ý 1 câu tiếng Anh chuẩn 5 sao hoàn hảo nhất thay thế cho câu của học viên>"
}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up markdown JSON blocks if Gemini returns them
    text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error evaluating speech:", error);
    return NextResponse.json(
      { error: "Failed to evaluate speech" },
      { status: 500 }
    );
  }
}
