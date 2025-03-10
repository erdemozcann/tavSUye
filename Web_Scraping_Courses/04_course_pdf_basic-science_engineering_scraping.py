import fitz  # PyMuPDF
import json
import re

# File names
pdf_source = "source.pdf"  # Name of the PDF file
json_source = "courses.json"  # JSON file to be updated
output_json = "updated_courses.json"  # New JSON file

# Extract ECTS data from PDF
ects_data = {}

with fitz.open(pdf_source) as doc:
    for page_num, page in enumerate(doc):
        text = page.get_text("text")  # Extract all text from the page
        lines = text.split("\n")  # Split text into lines

        # Regex to capture courses by detecting "FENS" and preceding numbers
        for i in range(len(lines)):
            if "FENS" in lines[i]:  # Found "FENS"
                try:
                    course_code_raw = lines[i - 2].strip()  # Course code is 2 lines above "FENS"
                    match = re.match(r"([A-Z]+)(\d+)", course_code_raw)
                    if match:
                        subject = match.group(1)
                        course_number = match.group(2)
                        course_code = f"{subject} {course_number}"
                    else:
                        continue

                    engineering_ects = float(lines[i + 2].strip().replace(",", "."))  # Second number below "FENS"
                    basic_science_ects = float(lines[i + 3].strip().replace(",", "."))  # Third number below "FENS"

                    # Store the data
                    ects_data[course_code] = {
                        "engineering_ects": int(engineering_ects),
                        "basic_science_ects": int(basic_science_ects)
                    }
                    print(
                        f"✅ {course_code}: Engineering ECTS: {int(engineering_ects)}, Basic Science ECTS: {int(basic_science_ects)}")
                except (IndexError, ValueError):
                    print(f"⚠️ Could not read ECTS data for {course_code_raw}, check the format!")

# Load the JSON file
with open(json_source, "r", encoding="utf-8") as f:
    courses = json.load(f)

# Update courses in the JSON file
for course in courses:
    course_key = f"{course['subject']} {course['course_code']}"
    if course_key in ects_data:
        course["engineering_ects"] = ects_data[course_key]["engineering_ects"]
        course["basic_science_ects"] = ects_data[course_key]["basic_science_ects"]
        print(
            f"🔄 Updated: {course_key} → Engineering ECTS: {ects_data[course_key]['engineering_ects']}, Basic Science ECTS: {ects_data[course_key]['basic_science_ects']}")

# Save the updated JSON file
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(courses, f, indent=4, ensure_ascii=False)

print(f"✅ Updated data successfully saved to {output_json}!")
