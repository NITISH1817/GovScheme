import json
import time
from deep_translator import GoogleTranslator
import sys
# Set default encoding to utf-8 to avoid UnicodeEncodeError in print
sys.stdout.reconfigure(encoding='utf-8')

with open('public/locales/en/translation.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

langs = {'mr': 'marathi', 'gu': 'gujarati'}

for code, lang_name in langs.items():
    print(f"Translating to {lang_name} ({code})...")
    translator = GoogleTranslator(source='en', target=code)
    
    translated_data = {}
    keys = list(en_data.keys())
    
    to_translate_keys = []
    to_translate_values = []
    
    for k in keys:
        v = en_data[k]
        if "{{" in v or "{t" in v:
            translated_data[k] = v
        else:
            to_translate_keys.append(k)
            to_translate_values.append(v)
            
    chunk_size = 25
    for i in range(0, len(to_translate_keys), chunk_size):
        chunk_keys = to_translate_keys[i:i+chunk_size]
        chunk_values = to_translate_values[i:i+chunk_size]
        try:
            translated_chunk = translator.translate_batch(chunk_values)
            for j, t in enumerate(translated_chunk):
                translated_data[chunk_keys[j]] = t if t is not None else chunk_values[j]
            print(f"Translated {i + len(chunk_keys)} / {len(to_translate_keys)}")
        except Exception as e:
            print(f"Error on batch {i}: {str(e)[:100]}")
            for k, v in zip(chunk_keys, chunk_values):
                translated_data[k] = v
        
        time.sleep(2)
        
    final_data = {}
    for k in keys:
        final_data[k] = translated_data.get(k, en_data[k])
        
    with open(f'public/locales/{code}/translation.json', 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"Finished {lang_name}")
