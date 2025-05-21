import json
import mysql.connector

# MySQL bağlantısı
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='ens491-321478965',
    database='university_feedback',
    charset='utf8mb4'
)
cursor = conn.cursor()

# JSON dosyasını yükle
with open("merged_programcourse_201701_202502.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Yardımcı: course_id çek
def get_course_id(subject, course_code):
    cursor.execute(
        "SELECT course_id FROM Course WHERE subject = %s AND course_code = %s",
        (subject, course_code)
    )
    result = cursor.fetchone()
    return result[0] if result else None

# Yardımcı: program_id çek
def get_program_id(name_en, admission_term):
    cursor.execute(
        "SELECT program_id FROM Program WHERE name_en = %s AND admission_term = %s",
        (name_en, admission_term)
    )
    result = cursor.fetchone()
    return result[0] if result else None

inserted = 0
skipped = 0
seen = set()

for entry in data:
    name_en = entry["name_en"]
    admission_term = entry["admission_term"]
    subject = entry["subject"]
    course_code = str(entry["course_code"])
    course_group = entry["course_group"]

    program_id = get_program_id(name_en, admission_term)
    course_id = get_course_id(subject, course_code)

    if program_id is None or course_id is None:
        print(f"⚠️ Skipped: {name_en} - {admission_term} - {subject} {course_code} (Not found)")
        skipped += 1
        continue

    key = (program_id, course_id, course_group)
    if key in seen:
        continue
    seen.add(key)

    cursor.execute(
        """
        INSERT INTO ProgramCourse (program_id, course_id, course_group)
        VALUES (%s, %s, %s)
        """,
        (program_id, course_id, course_group)
    )
    inserted += 1

conn.commit()
cursor.close()
conn.close()

print(f"\n✅ Inserted {inserted} ProgramCourse entries.")
print(f"⏭️ Skipped {skipped} entries due to missing program/course.")
