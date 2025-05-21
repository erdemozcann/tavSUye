import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import time

base_url_en = "https://fens.sabanciuniv.edu/en/faculty-members"
base_url_tr = "https://fens.sabanciuniv.edu/tr/faculty-members"
domain = "https://fens.sabanciuniv.edu"

def extract_instructor_links():
    print("🔗 [1/3] Fetching instructor list from EN page...")
    try:
        response = requests.get(base_url_en, timeout=20)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Failed to fetch EN page: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    cards = soup.select("div.col-xl-3.col-lg-4.col-md-6.col-12")

    instructors = []
    seen_links = set()  # 🔄 duplicate check

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

        image_style = card.select_one("figure.card-picture")["style"]
        image_url = None
        if "background-image" in image_style:
            image_url = "https:" + image_style.split("url('")[1].split("')")[0]

        instructors.append({
            "name": name,
            "surname": surname,
            "department": "FENS",
            "image_url": image_url,
            "link_en": link_en,
            "link_tr": link_tr
        })

    print(f"✅ Found {len(instructors)} unique instructors.")
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
                # Hemen sonraki <p> elementini al
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
        #time.sleep(0.1)
        inst["about_tr"] = extract_about(inst["link_tr"], "Areas of Interest")  # TR sayfada da başlık aynı
        #time.sleep(0.1)
    return instructors

def main():
    print("🚀 Starting instructor scraping process...")
    instructors = extract_instructor_links()
    if not instructors:
        print("❌ No instructors found. Exiting.")
        return

    instructors = enrich_with_about(instructors)

    print("💾 [3/3] Saving results to fens_instructors.json...")
    with open("fens_instructors.json", "w", encoding="utf-8") as f:
        json.dump(instructors, f, indent=2, ensure_ascii=False)

    print(f"\n✅ SUCCESS: Saved {len(instructors)} instructors to fens_instructors.json.")

if __name__ == "__main__":
    main()
