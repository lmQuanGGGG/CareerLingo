import os
import re
import json
import time
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})

def extract_array(filepath, var_name):
    with open(filepath, "r") as f:
        content = f.read()
    match = re.search(f'const {var_name} = \\[(.*?)\\];', content, re.DOTALL)
    if not match:
        # maybe it has export
        match = re.search(f'export const {var_name} = \\[(.*?)\\];', content, re.DOTALL)
    if not match:
        print(f"Could not find {var_name}")
        return []
    words_str = match.group(1)
    days = re.findall(r'"(.*?)"', words_str)
    return days

def generate_examples(days, industry_context, output_file):
    all_examples = []
    
    for i, day_str in enumerate(days):
        print(f"Processing Day {i+1} for {industry_context}...")
        pairs = day_str.split(',')
        words = [pair.split(':')[0].strip() for pair in pairs if ':' in pair]
        
        prompt = f"""
You are an expert English teacher for the {industry_context} industry.
I have a list of vocabulary words: {json.dumps(words)}.
For EACH word, generate a highly professional, natural, and advanced example sentence in English that would be used in a real {industry_context} context.
Also provide a high-quality Vietnamese translation of that sentence.
Output a JSON array of objects, where each object has:
- "word": the vocabulary word
- "eg": the English example sentence
- "eg_vn": the Vietnamese translation

Return EXACTLY a JSON array.
        """
        
        retries = 3
        for attempt in range(retries):
            try:
                response = model.generate_content(prompt)
                data = json.loads(response.text)
                all_examples.append(data)
                break
            except Exception as e:
                print(f"Error on day {i+1}, attempt {attempt+1}: {e}")
                time.sleep(2)
        
        time.sleep(1) # Rate limiting
        
    with open(output_file, "w") as f:
        json.dump(all_examples, f, indent=2, ensure_ascii=False)
    print(f"Saved {output_file}")

it_days = extract_array("src/app/itData.js", "IT_RAW_VOCAB_30_DAYS")
generate_examples(it_days, "Software Engineering / IT", "src/app/it_examples.json")

hos_days = extract_array("src/app/page.js", "RAW_VOCAB_30_DAYS")
generate_examples(hos_days, "5-star Resort Hospitality", "src/app/hos_examples.json")
