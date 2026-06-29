import fs from "fs/promises";

const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY";

async function extractArray(filepath, varName) {
  const content = await fs.readFile(filepath, "utf8");
  const match = content.match(new RegExp(`(?:export )?const ${varName} = \\[(.*?)\\];`, "s"));
  if (!match) return [];
  const wordsStr = match[1];
  const days = [];
  const regex = /"(.*?)"/g;
  let m;
  while ((m = regex.exec(wordsStr)) !== null) {
    days.push(m[1]);
  }
  return days;
}

async function generateExamples(days, industryContext, outputFile) {
  const allExamples = [];

  for (let i = 0; i < days.length; i++) {
    console.log(`Processing Day ${i + 1} for ${industryContext}...`);
    const dayStr = days[i];
    const pairs = dayStr.split(',');
    const words = pairs.map(p => p.split(':')[0].trim()).filter(Boolean);

    if (words.length === 0) continue;

    const prompt = `
You are an expert English teacher for the ${industryContext} industry.
I have a list of vocabulary words: ${JSON.stringify(words)}.
For EACH word, generate a highly professional, natural, and advanced example sentence in English that would be used in a real ${industryContext} context.
Also provide a high-quality Vietnamese translation of that sentence.
Output a JSON array of objects, where each object has:
- "word": the vocabulary word
- "eg": the English example sentence
- "eg_vn": the Vietnamese translation

Return EXACTLY a JSON array of ${words.length} items.
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    let success = false;
    for (let attempt = 0; attempt < 3 && !success; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const result = await response.json();
        const jsonText = result.candidates[0].content.parts[0].text;
        const data = JSON.parse(jsonText);
        allExamples.push(data);
        success = true;
      } catch (e) {
        console.error(`Error on day ${i + 1}, attempt ${attempt + 1}:`, e.message || e);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!success) {
      console.error(`Failed to generate for day ${i + 1}. Adding empty array.`);
      allExamples.push([]);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  await fs.writeFile(outputFile, JSON.stringify(allExamples, null, 2));
  console.log(`Saved ${outputFile}`);
}

async function main() {
  const itDays = await extractArray("src/app/itData.js", "IT_RAW_VOCAB_30_DAYS");
  await generateExamples(itDays, "Software Engineering / IT", "src/app/it_examples.json");

  const hosDays = await extractArray("src/app/page.js", "RAW_VOCAB_30_DAYS");
  await generateExamples(hosDays, "5-star Resort Hospitality", "src/app/hos_examples.json");
}

main().catch(console.error);
