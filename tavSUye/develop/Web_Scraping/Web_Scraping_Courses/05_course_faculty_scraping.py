import requests
from bs4 import BeautifulSoup
import json
import time

# Updated course JSON file
json_source = "updated_courses.json"
output_json = "updated_courses_v2.json"

# URL to fetch faculty information
base_url = "https://www.sabanciuniv.edu/en/prospective-students/undergraduate/course-catalog"

# Dictionary to store faculty data
faculty_data = {}

# Faculty name abbreviations
faculty_mapping = {
    "School of Languages": "SL",
    "Sabancı Business School": "FMAN",
    "Faculty of Engineering and Natural Sciences": "FENS",
    "Faculty of Arts and Social Sciences": "FASS"
}

# Web scraping to fetch faculty information
response = requests.get(base_url, headers={"User-Agent": "Mozilla/5.0"})
if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")
    course_rows = soup.find_all("tr")  # Get course rows

    for row in course_rows:
        cols = row.find_all("td")
        if len(cols) >= 2:
            course_code = cols[1].text.strip()  # Course code (e.g., "CS 201")
            faculty_name = cols[2].text.strip()  # Faculty name
            faculty_abbr = faculty_mapping.get(faculty_name, "Unknown")  # Get abbreviation
            faculty_data[course_code] = faculty_abbr
else:
    print("⚠️ Failed to fetch faculty information!")

# Load the JSON file
with open(json_source, "r", encoding="utf-8") as f:
    courses = json.load(f)

# Update courses in the JSON with faculty information
for course in courses:
    course_key = f"{course['subject']} {course['course_code']}"
    if course_key in faculty_data:
        course["faculty"] = faculty_data[course_key]
        print(f"✅ Faculty information added for {course_key}: {faculty_data[course_key]}")
    else:
        print(f"⚠️ Faculty not found for {course_key}!")

# Save the updated JSON file
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(courses, f, indent=4, ensure_ascii=False)

print(f"✅ Faculty information updated and saved to {output_json}!")
