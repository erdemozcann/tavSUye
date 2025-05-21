import os
import json

# JSON dosyalarının bulunduğu dizin (gerekirse kendi path'inle değiştir)
json_folder = "./"

# Birleştirmek istediğin JSON dosya adları (sırayla)
json_files = [
    "fens_instructors.json",
    "sl_instructors.json",
    "fass_instructors.json",
    "fman_instructors.json"
]

# Son birleşmiş veri
all_instructors = []

for filename in json_files:
    path = os.path.join(json_folder, filename)
    if not os.path.exists(path):
        print(f"❌ File not found: {filename}")
        continue
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            if isinstance(data, list):
                all_instructors.extend(data)
                print(f"✅ Loaded {len(data)} instructors from {filename}")
            else:
                print(f"⚠️ File does not contain a list: {filename}")
        except Exception as e:
            print(f"⚠️ Error reading {filename}: {e}")

# Sonucu yaz
output_file = "all_instructors.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(all_instructors, f, indent=2, ensure_ascii=False)

print(f"\n✅ Merged total of {len(all_instructors)} instructors into {output_file}")
