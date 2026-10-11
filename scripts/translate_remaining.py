import json
import time
import sys
from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding='utf-8')

with open('public/locales/en/translation.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

langs = {'mr': 'marathi', 'gu': 'gujarati'}

for code, lang_name in langs.items():
    print(f"\n--- Translating to {lang_name} ({code}) ---")
    translator = GoogleTranslator(source='en', target=code)
    
    # Load what we have so far to avoid re-translating
    target_path = f'public/locales/{code}/translation.json'
    try:
        with open(target_path, 'r', encoding='utf-8') as f:
            target_data = json.load(f)
    except FileNotFoundError:
        target_data = {}
        
    keys_to_translate = []
    for k, v in en_data.items():
        # Only translate if it's identical to English (untranslated) or missing
        # And skip interpolation keys which break easily
        if k not in target_data or target_data[k] == v:
            if "{{" not in v and "{t" not in v and "₹" not in v:
                keys_to_translate.append(k)
            else:
                target_data[k] = v
        
    print(f"Found {len(keys_to_translate)} keys to translate for {lang_name}.")
    
    count = 0
    total = len(keys_to_translate)
    
    for key in keys_to_translate:
        value = en_data[key]
        count += 1
        
        try:
            translated = translator.translate(value)
            target_data[key] = translated
            if count % 20 == 0:
                print(f"[{count}/{total}] Translated {key}")
        except Exception as e:
            print(f"Error on {key}: {str(e)[:50]}")
            target_data[key] = value
            # Back off for a bit
            time.sleep(2)
            
        # Sleep to stay under 5 requests/sec limit
        time.sleep(0.35)
        
    # Save the file
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(target_data, f, ensure_ascii=False, indent=2)
    
    print(f"Finished {lang_name}")
