import requests
from bs4 import BeautifulSoup
import time

# Input and output files
input_txt_path = "course_codes.txt"
output_txt_path = "filtered_courses.txt"

# SUIS site URL format to check course content
base_url = "https://suis.sabanciuniv.edu/prod/sabanci_www.p_get_courses?levl_code=UG&subj_code={}&crse_numb={}&lang=tur"

# List to store filtered courses
filtered_courses = []

# Read the course codes from course_codes.txt
with open(input_txt_path, "r", encoding="utf-8") as f:
    course_codes = [line.strip() for line in f.readlines()]

# Check the content of each course
for course in course_codes:
    try:
        subject, course_number = course.split(" ")
        url = base_url.format(subject, course_number)
        print(f"Checking: {subject} {course_number}")

        # Fetch data from the website
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code != 200:
            print(f"⚠️ Unable to access the page for {subject} {course_number}!")
            continue

        # Parse the HTML content
        soup = BeautifulSoup(response.text, "html.parser")
        content_div = soup.find("td", colspan="2")  # Content is located here

        # Check for non-empty content
        if content_div and content_div.text.strip():
            filtered_courses.append(course)

        # Add a delay to prevent overloading the server
        time.sleep(0.5)

    except Exception as e:
        print(f"An error occurred ({subject} {course_number}): {str(e)}")

# Save to a TXT file
with open(output_txt_path, "w", encoding="utf-8") as f:
    f.write("\n".join(filtered_courses))

print(f"✅ Courses with content successfully saved to {output_txt_path}!")
