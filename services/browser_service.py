
import requests
import os
from playwright.sync_api import sync_playwright

class BrowserService:
    def __init__(self, download_dir="downloads"):
        # Vercelなどのサーバーレス環境では /tmp のみが書き込み可能
        if os.environ.get('VERCEL'):
            self.download_dir = os.path.join('/tmp', download_dir)
        else:
            self.download_dir = download_dir
            
        if not os.path.exists(self.download_dir):
            os.makedirs(self.download_dir)

    def download_pdf_from_url(self, url):
        """
        Attempts to download a PDF from the given URL.
        Tries requests first, then Playwright.
        Returns the path to the downloaded file or None.
        """
        if not url:
            return None
            
        filename = url.split("/")[-1]
        if not filename.lower().endswith(".pdf"):
            filename += ".pdf"
        filepath = os.path.join(self.download_dir, filename)

        # Method 1: Requests
        try:
            print(f"Attempting download with requests: {url}")
            response = requests.get(url, timeout=10)
            if response.status_code == 200 and 'application/pdf' in response.headers.get('Content-Type', ''):
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded with requests: {filepath}")
                return filepath
        except Exception as e:
            print(f"Requests download failed: {e}")

        # Method 2: Playwright
        print(f"Attempting download with Playwright: {url}")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                try:
                    # Note: This is a simplified logic. Real world might need handling of download events.
                    # For now, we assume the URL might trigger a download or be a direct link we missed.
                    # Or we might need to print to PDF.
                    
                    # If it's a page, maybe we print it to PDF?
                    page.goto(url)
                    page.pdf(path=filepath)
                    print(f"Printed page to PDF with Playwright: {filepath}")
                    browser.close()
                    return filepath
                except Exception as e:
                    print(f"Playwright error: {e}")
                    browser.close()
        except Exception as e:
             print(f"Playwright launch failed: {e}")

        return None
