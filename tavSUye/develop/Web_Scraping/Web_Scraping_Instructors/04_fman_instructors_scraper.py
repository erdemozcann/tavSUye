import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json

base_url_en = "https://sbs.sabanciuniv.edu/en/faculty-members-and-administrative-staff"
base_url_tr = "https://sbs.sabanciuniv.edu/tr/faculty-members-and-administrative-staff"
domain = "https://sbs.sabanciuniv.edu"
group_ids = [261, 264, 262, 265, 266, 267, 1122]

def extract_instructor_links():
    print("🔗 [1/3] Fetching instructor list from EN pages (with group IDs)...")
    instructors = []
    seen_links = set()

    for gid in group_ids:
        try:
            response = requests.get(f"{base_url_en}?group_id={gid}", timeout=20)
            response.raise_for_status()
        except Exception as e:
            print(f"❌ Failed to fetch EN page for group_id={gid}: {e}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.select("div.col-xl-3.col-lg-4.col-md-6.col-12")

        for card in cards:
            a_tag = card.find("a", href=True)
            if not a_tag:
                continue

            link_en = urljoin(domain, a_tag["href"])
            if link_en in seen_links:
                continue
            seen_links.add(link_en)

            link_tr = link_en.replace("/en/", "/tr/")

            name_tag = card.select_one(".card-title")
            if not name_tag:
                continue

            full_name = name_tag.get_text(strip=True)
            name_parts = full_name.split()
            name = " ".join(name_parts[:-1])
            surname = name_parts[-1]

            image_url = None
            figure = card.select_one("figure.card-picture")
            if figure and "background-image" in figure.get("style", ""):
                image_url = "https:" + figure["style"].split("url('")[1].split("')")[0]

            instructors.append({
                "name": name,
                "surname": surname,
                "department": "FMAN",
                "image_url": image_url,
                "link_en": link_en,
                "link_tr": link_tr
            })

    print(f"✅ Found {len(instructors)} unique instructors across all group_ids.")
    return instructors

def extract_about(url, keyword):
    try:
        print(f"🌐 Fetching profile: {url}")
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        span_tags = soup.find_all("span")
        for span in span_tags:
            if keyword.lower() in span.get_text(strip=True).lower():
                next_p = span.find_next("p")
                if next_p:
                    return next_p.get_text(strip=True)
        return None
    except Exception as e:
        print(f"⚠️ Could not fetch about from {url} -> {e}")
        return None

def enrich_with_about(instructors):
    print("📝 [2/3] Fetching About (EN/TR) for each instructor...")
    for i, inst in enumerate(instructors, start=1):
        print(f"\n🔍 [{i}/{len(instructors)}] {inst['name']} {inst['surname']}")
        inst["about_en"] = extract_about(inst["link_en"], "Areas of Interest")
        inst["about_tr"] = extract_about(inst["link_tr"], "Areas of Interest")
    return instructors

def main():
    print("🚀 Starting instructor scraping process for FMAN (all group_ids)...")
    instructors = extract_instructor_links()
    if not instructors:
        print("❌ No instructors found. Exiting.")
        return

    instructors = enrich_with_about(instructors)

    print("💾 [3/3] Saving results to fman_instructors.json...")
    with open("fman_instructors.json", "w", encoding="utf-8") as f:
        json.dump(instructors, f, indent=2, ensure_ascii=False)

    print(f"\n✅ SUCCESS: Saved {len(instructors)} instructors to fman_instructors.json.")

if __name__ == "__main__":
    main()
