import requests
from bs4 import BeautifulSoup
import json
import re
import time

# Input file containing course codes
input_txt_path = "filtered_courses.txt"

# New structured site URL
base_url_new = "https://www.sabanciuniv.edu/{}/aday-ogrenciler/lisans/ders-katalogu/course/{}"

# List to store JSON data
all_courses = []

# Read course codes from the TXT file
with open(input_txt_path, "r", encoding="utf-8") as f:
    course_codes = [line.strip() for line in f.readlines()]

# Fetch course details for each course
for course in course_codes:
    try:
        subject, course_number = course.split(" ")
        print(f"Processing: {subject} {course_number}")

        # Fetch course details in two languages
        course_data = {
            "subject": subject,
            "course_code": course_number,
            "course_name_en": "",
            "course_name_tr": "",
            "su_credit": None,
            "ects_credit": None,
            "content_en": "",
            "content_tr": "",
            "link_en": f"https://suis.sabanciuniv.edu/prod/sabanci_www.p_get_courses?levl_code=UG&subj_code={subject}&crse_numb={course_number}&lang=eng",
            "link_tr": f"https://suis.sabanciuniv.edu/prod/sabanci_www.p_get_courses?levl_code=UG&subj_code={subject}&crse_numb={course_number}&lang=tur",
        }

        # Fetch credit and content details from the English site
        for lang in ["en", "tr"]:
            url = base_url_new.format(lang, f"{subject}-{course_number}")
            response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})

            if response.status_code != 200:
                print(f"⚠️ {lang.upper()} page not found for {subject} {course_number}!")
                continue

            soup = BeautifulSoup(response.text, "html.parser")

            # Course Name
            course_name = soup.find("div", class_="course-catalog-title").find("a")
            if course_name:
                name_text = course_name.text.strip()
                cleaned_name = re.sub(rf"^{subject} {course_number} ", "", name_text)
                if lang == "en":
                    course_data["course_name_en"] = cleaned_name
                else:
                    course_data["course_name_tr"] = cleaned_name

            # SU Credit and ECTS Credit (only fetched from English page)
            if lang == "en":
                su_credit_value, ects_credit_value = None, None
                credit_divs = soup.find("div", class_="course-catalog-info").find_all("div")

                for div in credit_divs:
                    bold_tag = div.find("b")
                    if bold_tag:
                        label = bold_tag.text.strip()
                        value = div.text.replace(label, "").strip()

                        if "SU Credits" in label:
                            su_credit_match = re.search(r"(\d+)", value)
                            if su_credit_match:
                                su_credit_value = int(su_credit_match.group(1))

                        if "ECTS Credit" in label:
                            ects_credit_match = re.search(r"(\d+)", value)
                            if ects_credit_match:
                                ects_credit_value = int(ects_credit_match.group(1))

                # Save the values
                if su_credit_value is not None:
                    course_data["su_credit"] = su_credit_value
                if ects_credit_value is not None:
                    course_data["ects_credit"] = ects_credit_value

            # Course Content
            content_div = soup.find("div", class_="course-catalog-detail")
            if content_div:
                if lang == "en":
                    course_data["content_en"] = content_div.text.strip()
                else:
                    course_data["content_tr"] = content_div.text.strip()

        # If both course name and content are empty, it means the course doesn't exist
        if not course_data["course_name_en"] and not course_data["course_name_tr"]:
            print(f"❌ No content found for {subject} {course_number}.")
        else:
            all_courses.append(course_data)

        # Add a delay to avoid overloading the server
        time.sleep(1)

    except Exception as e:
        print(f"Error occurred ({subject} {course_number}): {str(e)}")

# Save data to a JSON file
output_json_path = "courses.json"
with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(all_courses, f, indent=4, ensure_ascii=False)

print(f"✅ All courses successfully saved to {output_json_path}!")
