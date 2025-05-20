import json
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# Program listesi
programs = {
    "BSCS": "Computer Science and Engineering",
    "BSDSA": "Data Science and Analytics",
    "BAECON": "Economics",
    "BSEE": "Electronics Engineering",
    "BSMS": "Industrial Engineering",
    "BAMAN": "Management",
    "BSMAT": "Materials Science and Nano Engineering",
    "BSME": "Mechatronics Engineering",
    "BSBIO": "Molecular Biology, Genetics and Bioengineering",
    "BAPSIR": "Political Science and International Relations",
    "BAPSY": "Psychology",
    "BAVACD": "Visual Arts and Visual Communications Design"
}

program_tr_map = {
    "Computer Science and Engineering": "Bilgisayar Bilimi ve Mühendisliği",
    "Data Science and Analytics": "Veri Bilimi ve Analitiği",
    "Economics": "Ekonomi",
    "Electronics Engineering": "Elektronik Mühendisliği",
    "Industrial Engineering": "Endüstri Mühendisliği",
    "Management": "Yönetim Bilimleri",
    "Materials Science and Nano Engineering": "Malzeme Bilimi ve Nano Mühendislik",
    "Mechatronics Engineering": "Mekatronik Mühendisliği",
    "Molecular Biology, Genetics and Bioengineering": "Moleküler Biyoloji, Genetik ve Biyomühendislik",
    "Political Science and International Relations": "Siyaset Bilimi ve Uluslararası İlişkiler",
    "Psychology": "Psikoloji",
    "Visual Arts and Visual Communications Design": "Görsel Sanatlar ve Görsel İletişim Tasarımı"
}

def parse_summary_table(soup):
    tables = soup.find_all("table")
    if len(tables) < 2:
        return {}

    rows = tables[1].find_all("tr")
    data = {}

    for row in rows:
        cells = [td.text.strip().replace("–", "-") for td in row.find_all("td")]
        if len(cells) >= 3:
            label = cells[0].strip().lower()
            val = [int(c) if c.isdigit() else None for c in cells[1:4]]

            if label.startswith("university courses"):
                data["university_credits"] = val[1]
            elif label == "required courses":
                data["required_credits"] = val[1]
                data["required_min_courses"] = val[2]
            elif label.startswith("mathematics requirement"):
                data["math_required_credits"] = val[1]
                data["math_min_courses"] = val[2]
            elif label.startswith("philosophy requirement"):
                data["philosophy_required_credits"] = val[1]
                data["philosophy_min_courses"] = val[2]
            elif label.startswith("core electives ii"):
                data["core_elective_credits_ii"] = val[1]
                data["core_elective_min_courses_ii"] = val[2]
            elif label.startswith("core electives i"):
                data["core_elective_credits_i"] = val[1]
                data["core_elective_min_courses_i"] = val[2]
            elif label.startswith("core elective courses") or label == "core electives":
                data["core_credits"] = val[1]
                data["core_min_courses"] = val[2]
            elif label.startswith("area elective courses") or label == "area electives":
                data["area_credits"] = val[1]
                data["area_min_courses"] = val[2]
            elif label.startswith("free electives"):
                data["free_elective_credits"] = val[1]
                data["free_elective_min_courses"] = val[2]
            elif label.startswith("faculty courses"):
                data["faculty_credits"] = val[1]
                data["faculty_min_courses"] = val[2]
            elif "engineering" in label:
                data["engineering_ects"] = val[0]
            elif "basic science" in label:
                data["basic_science_ects"] = val[0]
            elif label.startswith("total"):
                data["total_min_ects"] = val[0]
                data["total_min_credits"] = val[1]

    return data

def scrape_all():
    all_data = []
    for code, name_en in tqdm(programs.items(), desc="📘 Programs"):
        for year in range(2017, 2026):
            for term in ["01", "02", "03"]:
                term_code = f"{year}{term}"
                if int(term_code) > 202502:
                    continue

                url = f"https://suis.sabanciuniv.edu/prod/SU_DEGREE.p_degree_detail?P_PROGRAM={code}&P_LANG=EN&P_LEVEL=UG&P_TERM={term_code}&P_SUBMIT=Select"
                res = requests.get(url)

                if "University Courses" not in res.text:
                    continue  # geçersiz ya da boş sayfa

                soup = BeautifulSoup(res.text, "lxml")
                summary = parse_summary_table(soup)
                if summary:
                    all_data.append({
                        "name_en": name_en,
                        "name_tr": program_tr_map[name_en],
                        "admission_term": int(term_code),
                        **summary
                    })
    return all_data

if __name__ == "__main__":
    print("⏳ Scraping started...")
    data = scrape_all()
    print(f"✅ Completed. Total valid records: {len(data)}")

    with open("su_programs_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("💾 Saved to su_programs_data.json")
