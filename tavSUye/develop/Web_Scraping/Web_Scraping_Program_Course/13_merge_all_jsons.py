import json
import glob
import os

# JSON dosyalarını bul
json_files = glob.glob("*_courses_201701_202502.json")

all_data = []

for file in json_files:
    with open(file, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            all_data.extend(data)
            print(f"✅ Yüklendi: {file} ({len(data)} kayıt)")
        except Exception as e:
            print(f"❌ Hata ({file}): {e}")

# Hepsini tek dosyada kaydet
output_file = "merged_programcourse_201701_202502.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False)

print(f"\n📦 Toplam {len(all_data)} ders başarıyla '{output_file}' dosyasına kaydedildi.")
