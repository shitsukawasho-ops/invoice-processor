import requests
import os

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
        Downloads a PDF from a URL using requests.
        """
        if not url:
            return None
            
        filename = url.split("/")[-1]
        if not filename.lower().endswith(".pdf"):
            filename = "downloaded_document.pdf" # Default name if not a PDF extension
            
        filepath = os.path.join(self.download_dir, filename)
        
        try:
            print(f"Attempting download with requests: {url}")
            response = requests.get(url, timeout=10)
            if response.status_code == 200 and 'application/pdf' in response.headers.get('Content-Type', ''):
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                print(f"PDF downloaded successfully: {filepath}")
                return filepath
        except Exception as e:
            print(f"Requests download failed: {e}")

        return None
