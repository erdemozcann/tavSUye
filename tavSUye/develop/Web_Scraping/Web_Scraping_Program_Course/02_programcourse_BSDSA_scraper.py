import requests
from bs4 import BeautifulSoup
import re
import json

program_code = "BSDSA"
program_name_en = "Data Science and Analytics"

main_url = "https://suis.sabanciuniv.edu/prod/SU_DEGREE.p_degree_detail"
elective_url = "https://suis.sabanciuniv.edu/prod/SU_DEGREE.p_list_courses"

terms = [f"{y}{t:02d}" for y in range(2017, 2026) for t in [1, 2, 3] if int(f"{y}{t:02d}") <= 202502]

elective_groups = {
    "CORE": "BSDSA_CEL",
    "AREA": "BSDSA_AEL",
    "FREE": "BSDSA_FEL"
}

def extract_subject_code(text):
    match = re.match(r"([A-Z]+)\s?(\d{3,5})", text.strip())
    if match:
        return match.group(1), int(match.group(2))
    return None, None

def parse_table(table, course_group, term):
    courses = []
    for row in table.find_all("tr"):
        tds = row.find_all("td")
        if len(tds) >= 2:
            a = tds[1].find("a")
            if a:
                text = a.get_text(strip=True)
                subject, code = extract_subject_code(text)
                if subject and code:
                    courses.append({
                        "name_en": program_name_en,
                        "admission_term": int(term),
                        "subject": subject,
                        "course_code": code,
                        "course_group": course_group
                    })
    return courses

def get_main_page_data(term):
    params = {
        "P_PROGRAM": program_code,
        "P_LANG": "EN",
        "P_LEVEL": "UG",
        "P_TERM": term,
        "P_SUBMIT": "Select"
    }
    response = requests.get(main_url, params=params)
    soup = BeautifulSoup(response.text, "html.parser")
    result = []

    def get_table_after_anchor(anchor_name, course_group):
        anchor = soup.find("a", attrs={"name": anchor_name})
        if not anchor:
            return []

        first_table = anchor.find_parent("table")
        tables = first_table.find_all_next("table")
        for table in tables:
            if table.find("a"):
                return parse_table(table, course_group, term)
        return []

    def get_university_courses_fallback():
        b_tag = soup.find("b", string=lambda s: s and "University Courses" in s)
        if not b_tag:
            print(f"⚠️ University başlığı <b> etiketiyle de bulunamadı ({term})")
            return []

        first_table = b_tag.find_parent("table")
        tables = first_table.find_all_next("table")
        for table in tables:
            if table.find("a"):
                return parse_table(table, "UNIVERSITY", term)
        return []

    # 🔍 University Courses: anchor dene → fallback <b> etiketi
    uni_courses = get_table_after_anchor("UC_FASS", "UNIVERSITY")  # eski anchor
    if not uni_courses:
        uni_courses = get_university_courses_fallback()
    result += uni_courses

    # 🔍 Required
    result += get_table_after_anchor(f"{program_code}_REQ", "REQUIRED")

    return result

def get_elective_courses(term):
    results = []
    for group, area_code in elective_groups.items():
        params = {
            "P_TERM": term,
            "P_AREA": area_code,
            "P_PROGRAM": program_code,
            "P_LANG": "EN",
            "P_LEVEL": "UG"
        }
        try:
            response = requests.get(elective_url, params=params, timeout=10)
            soup = BeautifulSoup(response.text, "html.parser")
            results += parse_table(soup, group, term)
        except Exception as e:
            print(f"{term} - {group} çekim hatası: {e}")
    return results

# Dönemleri dolaş
all_courses = []
for term in terms:
    print(f"📅 {term} dönemi işleniyor...")
    all_courses += get_main_page_data(term)
    all_courses += get_elective_courses(term)

# JSON çıktısı
with open("bsdsa_courses_201701_202502.json", "w", encoding="utf-8") as f:
    json.dump(all_courses, f, indent=2, ensure_ascii=False)

print(f"\n✅ BSDSA programı için toplam {len(all_courses)} ders çekildi.")
