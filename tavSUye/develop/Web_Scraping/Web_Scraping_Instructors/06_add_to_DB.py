import json
import mysql.connector

# JSON dosya yolu
json_path = "all_instructors.json"

# MySQL bağlantı bilgileri
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "********",
    "database": "********"
}

# Veriyi oku
with open(json_path, "r", encoding="utf-8") as f:
    instructors = json.load(f)

# DB bağlantısı
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

insert_query = """
INSERT INTO Instructor (name, surname, department, image_url, about_tr, about_en, link_tr, link_en)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""

# Kayıt ekleme
inserted = 0
for inst in instructors:
    try:
        cursor.execute(insert_query, (
            inst["name"],
            inst["surname"],
            inst.get("department"),
            inst.get("image_url"),
            inst.get("about_tr"),
            inst.get("about_en"),
            inst.get("link_tr"),
            inst.get("link_en")
        ))
        inserted += 1
    except Exception as e:
        print(f"❌ Failed to insert {inst['name']} {inst['surname']} -> {e}")

# Commit ve kapat
conn.commit()
cursor.close()
conn.close()

print(f"✅ Inserted {inserted} instructors into the database.")
