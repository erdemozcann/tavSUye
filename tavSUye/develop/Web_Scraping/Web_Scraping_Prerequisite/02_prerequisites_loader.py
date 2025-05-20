import json
import mysql.connector

# MySQL bağlantısı
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='ens491-321478965',     # 🔒 Şifreni gir
    database='university_feedback',     # 🔄 Veritabanı adını gir
    charset='utf8mb4'
)
cursor = conn.cursor()

# JSON dosyasını yükle
with open("prerequisite_data.json", "r", encoding="utf-8") as file:
    data = json.load(file)

def get_course_id(subject, course_code):
    cursor.execute(
        "SELECT course_id FROM Course WHERE subject = %s AND course_code = %s",
        (subject, course_code)
    )
    result = cursor.fetchone()
    return result[0] if result else None

inserted = 0
skipped = 0

for entry in data:
    course_subject = entry["course_subject"]
    course_code = entry["course_code"]
    prerequisites = entry.get("prerequisites", [])

    # Bu dersin kendi ID'sini al
    course_id = get_course_id(course_subject, course_code)
    if course_id is None:
        print(f"❌ Main course not found in DB: {course_subject} {course_code}")
        skipped += 1
        continue

    # Duplicate'leri kaldırmak için hash set
    seen = set()

    for prereq in prerequisites:
        prereq_subject = prereq["subject"]
        prereq_code = prereq["course_code"]
        is_and = prereq["is_and"]

        prereq_id = get_course_id(prereq_subject, prereq_code)
        if prereq_id is None:
            print(f"⚠️ Prerequisite not found in DB: {prereq_subject} {prereq_code}")
            continue

        key = (course_id, prereq_id, is_and)
        if key in seen:
            continue  # tekrar varsa atla
        seen.add(key)

        cursor.execute(
            """
            INSERT INTO Prerequisite (course_id, prerequisite_course_id, is_and)
            VALUES (%s, %s, %s)
            """,
            (course_id, prereq_id, is_and)
        )
        inserted += 1

conn.commit()
cursor.close()
conn.close()

print(f"✅ Inserted {inserted} prerequisite entries.")
print(f"⏭️ Skipped {skipped} courses (main course not in DB).")
