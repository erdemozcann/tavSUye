import requests
import time
from bs4 import BeautifulSoup
import platform
import os

def beep():
    if platform.system() == 'Windows':
        import winsound
        winsound.Beep(1000, 1000)  # 1000 Hz, 1 saniye
    else:
        # Unix tabanlı sistemler için
        os.system('say "Final takvimi yayınlandı"')  # macOS için
        # Alternatif olarak, aşağıdaki satırı kullanabilirsiniz:
        # print('\a')  # Terminalde bip sesi

def get_page_content(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        # Sayfanın ana içeriğini al
        main_content = soup.get_text(strip=True)
        return main_content
    except Exception as e:
        print(f"Hata oluştu: {e}")
        return None

def monitor_page(url, interval=5):
    print(f"{url} adresi izleniyor...")
    initial_content = get_page_content(url)
    if initial_content is None:
        print("Sayfa içeriği alınamadı. Çıkılıyor.")
        return

    while True:
        time.sleep(interval)
        current_content = get_page_content(url)
        if current_content is None:
            continue
        if current_content != initial_content:
            print("Sayfa içeriği değişti! Final takvimi yayınlanmış olabilir.")
            beep()
            time.sleep(1)
            beep()
            time.sleep(1)
            beep()
            time.sleep(1)
            beep()
            time.sleep(1)
            break
        else:
            print("Henüz bir değişiklik yok...")

if __name__ == "__main__":
    url = "https://suis.sabanciuniv.edu/HbbmInst/P_FINAL_EXAM_SCHEDULE.p_print_shedule"
    monitor_page(url)

