import requests
from bs4 import BeautifulSoup
import re
import json

program_code = "BAPSIR"
program_name_en = "Political Science and International Relations"

main_url = "https://suis.sabanciuniv.edu/prod/SU_DEGREE.p_degree_detail"
free_url = "https://suis.sabanciuniv.edu/prod/SU_DEGREE.p_list_courses"

# Tüm geçerli term’ler
terms = [f"{y}{t:02d}" for y in range(2017, 2026) for t in [1, 2, 3] if int(f"{y}{t:02d}") <= 202502]

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
            print(f"⚠️ Anchor bulunamadı: {anchor_name} ({term})")
            return []

        first_table = anchor.find_parent("table")
        tables = first_table.find_all_next("table")

        for table in tables:
            if table.find("a"):
                return parse_table(table, course_group, term)

        print(f"⚠️ {course_group} için ders tablosu bulunamadı ({term})")
        return []

    result += get_table_after_anchor("UC_FASS", "UNIVERSITY")
    result += get_table_after_anchor(f"{program_code}_REQ", "REQUIRED")
    result += get_table_after_anchor(f"{program_code}_C1", "CORE I")
    result += get_table_after_anchor(f"{program_code}_C2", "CORE II")
    result += get_table_after_anchor(f"{program_code}_AEL", "AREA")

    return result

def get_free_courses(term):
    params_free = {
        "P_TERM": term,
        "P_AREA": f"{program_code}_FEL",
        "P_PROGRAM": program_code,
        "P_LANG": "EN",
        "P_LEVEL": "UG"
    }
    try:
        response = requests.get(free_url, params=params_free, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        return parse_table(soup, "FREE", term)
    except Exception as e:
        print(f"Free elective çekim hatası ({term}): {e}")
        return []

# Tüm dönemleri dolaş
all_courses = []
for term in terms:
    print(f"📅 {term} dönemi işleniyor...")
    all_courses += get_main_page_data(term)
    all_courses += get_free_courses(term)

# JSON çıktısı
with open("bapsir_courses_201701_202502.json", "w", encoding="utf-8") as f:
    json.dump(all_courses, f, indent=2, ensure_ascii=False)

# Özet
print(f"\n✅ Toplam {len(all_courses)} ders çekildi.")
