import json
import mysql.connector

# MySQL bağlantısı
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='***********',  # Şifreni buraya yaz
    database='***********',  # Veritabanı adını buraya yaz
    charset='utf8mb4'
)
cursor = conn.cursor()

# JSON dosyasını oku
with open('su_programs_data.json', 'r', encoding='utf-8') as file:
    programs = json.load(file)

# Programları ekle
for p in programs:
    insert_query = """
    INSERT INTO Program (
        name_en, name_tr, admission_term,
        university_credits, university_min_courses,
        required_credits, required_min_courses,
        core_credits, core_min_courses,
        core_elective_credits_i, core_elective_min_courses_i,
        core_elective_credits_ii, core_elective_min_courses_ii,
        area_credits, area_min_courses,
        free_elective_credits, free_elective_min_courses,
        faculty_credits, faculty_min_courses,
        math_required_credits, math_min_courses,
        philosophy_required_credits, philosophy_min_courses,
        engineering_ects, basic_science_ects,
        total_min_ects, total_min_credits
    ) VALUES (
        %s, %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s
    )
    """

    cursor.execute(insert_query, (
        p.get("name_en"),
        p.get("name_tr"),
        p.get("admission_term"),

        p.get("university_credits"),
        p.get("university_min_courses"),

        p.get("required_credits"),
        p.get("required_min_courses"),

        p.get("core_credits"),
        p.get("core_min_courses"),

        p.get("core_elective_credits_i"),
        p.get("core_elective_min_courses_i"),

        p.get("core_elective_credits_ii"),
        p.get("core_elective_min_courses_ii"),

        p.get("area_credits"),
        p.get("area_min_courses"),

        p.get("free_elective_credits"),
        p.get("free_elective_min_courses"),

        p.get("faculty_credits"),
        p.get("faculty_min_courses"),

        p.get("math_required_credits"),
        p.get("math_min_courses"),

        p.get("philosophy_required_credits"),
        p.get("philosophy_min_courses"),

        p.get("engineering_ects"),
        p.get("basic_science_ects"),

        p.get("total_min_ects"),
        p.get("total_min_credits")
    ))

# Değişiklikleri kaydet ve bağlantıyı kapat
conn.commit()
cursor.close()
conn.close()

print("Programlar başarıyla yüklendi.")
