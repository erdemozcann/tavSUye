import requests
from bs4 import BeautifulSoup
import time

# Base URL
base_url = "https://www.sabanciuniv.edu/tr/aday-ogrenciler/lisans/ders-katalogu?page="

# User-Agent header
headers = {"User-Agent": "Mozilla/5.0"}

# List to store all course codes
all_course_codes = []

# Loop through 54 pages
for page in range(1, 55):
    url = base_url + str(page)
    print(f"Fetching data from: {url}")

    # Fetch the page
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error! Unable to load page: {url}")
        continue

    # Parse the HTML content
    soup = BeautifulSoup(response.text, "html.parser")

    # Find the course table
    table = soup.find("table", {"id": "course-catalog-table"})

    if table:
        # Get all rows in the table
        rows = table.find("tbody").find_all("tr")

        for row in rows:
            # Get all columns in each row
            cols = row.find_all("td")

            if len(cols) > 1:
                course_code = cols[1].get_text(strip=True)  # Course code column
                all_course_codes.append(course_code)

    # Add a short delay to avoid excessive requests
    time.sleep(1)

# Remove duplicate course codes and sort them
all_course_codes = sorted(set(all_course_codes))

# Save course codes to a TXT file
output_txt_path = "course_codes.txt"
with open(output_txt_path, "w", encoding="utf-8") as f:
    for code in all_course_codes:
        f.write(code + "\n")

print(f"Course codes successfully saved to {output_txt_path}!")
