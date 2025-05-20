import json
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import re

# 📌 Metin bloklarından Prerequisite satırını ayıkla
def extract_prereq_text_from_block(soup):
    text_block = soup.get_text(separator="\n")
    lines = text_block.split("\n")
    prereq_lines = []
    collect = False

    for line in lines:
        line = line.strip()
        if "Prerequisite" in line:
            collect = True
            if ":" in line:
                prereq_lines.append(line.split(":", 1)[1].strip())
        elif any(k in line for k in ["Corequisite", "ECTS", "General Requirement"]):
            break
        elif collect:
            prereq_lines.append(line)

    return " ".join(prereq_lines).strip()

# 📌 Metinden ders bilgilerini çıkar: AND/OR'ları ayrıştır
def extract_prerequisites(text):
    prereqs = []

    if not text or text.strip() == "_" or text.strip() == "":
        return prereqs

    # "or" ile ayır, her bir parçayı ayrı ele al
    or_groups = re.split(r'\bor\b', text, flags=re.IGNORECASE)

    for group in or_groups:
        and_parts = re.split(r'\band\b', group, flags=re.IGNORECASE)
        and_parts = [p.strip() for p in and_parts if p.strip()]
        for part in and_parts:
            match = re.search(r'([A-Z]{2,4})\s+(\d{3})', part)
            if match:
                subject = match.group(1).strip()
                code = match.group(2).strip()
                prereqs.append({
                    "subject": subject,
                    "course_code": code,
                    "is_and": len(and_parts) > 1  # birden fazla varsa AND'dir
                })

    return prereqs

# 📂 JSON'dan dersleri oku
with open("updated_courses_v2.json", "r", encoding="utf-8") as f:
    courses = json.load(f)

all_data = []

# 🔁 Her dersin sayfasına gidip prerequisite'leri topla
for course in tqdm(courses, desc="🔍 Checking prerequisites"):
    subject = course["subject"]
    code = course["course_code"]
    url = course["link_en"]

    try:
        response = requests.get(url, timeout=10)

        try:
            soup = BeautifulSoup(response.text, "lxml")
        except Exception:
            soup = BeautifulSoup(response.text, "html.parser")

        prereq_text = extract_prereq_text_from_block(soup)
        prerequisites = extract_prerequisites(prereq_text)

        if prerequisites:
            all_data.append({
                "course_subject": subject,
                "course_code": code,
                "prerequisites": prerequisites
            })
            print(f"✅ {subject} {code}: {len(prerequisites)} prerequisite(s)")
        else:
            print(f"ℹ️ {subject} {code}: no prerequisite.")

    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")

# 💾 JSON çıktısını kaydet
with open("prerequisite_data.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ prerequisite_data.json başarıyla oluşturuldu. Toplam ders: {len(all_data)}")
