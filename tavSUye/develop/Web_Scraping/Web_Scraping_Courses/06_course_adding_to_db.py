import json
import mysql.connector

# MySQL bağlantısı
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='***********',
    database='***********',
    charset='utf8mb4'
)
cursor = conn.cursor()

# JSON dosyasını oku
with open('updated_courses_v2.json', 'r', encoding='utf-8') as file:
    courses = json.load(file)

# Kursları ekle
for course in courses:
    subject = course.get("subject")
    course_code = course.get("course_code")
    course_name_en = course.get("course_name_en")
    course_name_tr = course.get("course_name_tr")
    su_credit = course.get("su_credit")
    ects_credit = course.get("ects_credit")
    content_en = course.get("content_en")
    content_tr = course.get("content_tr")
    link_en = course.get("link_en")
    link_tr = course.get("link_tr")
    faculty = course.get("faculty")

    # Sadece FENS fakültesi için geçerli
    engineering_ects = course.get("engineering_ects") if faculty == "FENS" else None
    basic_science_ects = course.get("basic_science_ects") if faculty == "FENS" else None

    insert_query = """
    INSERT INTO Course (
        subject, course_code, course_name_en, course_name_tr,
        su_credit, ects_credit, content_en, content_tr,
        link_en, link_tr, faculty, engineering_ects,
        basic_science_ects
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    cursor.execute(insert_query, (
        subject, course_code, course_name_en, course_name_tr,
        su_credit, ects_credit, content_en, content_tr,
        link_en, link_tr, faculty, engineering_ects,
        basic_science_ects
    ))

# Değişiklikleri kaydet ve bağlantıyı kapat
conn.commit()
cursor.close()
conn.close()

print("Kurslar başarıyla yüklendi.")
