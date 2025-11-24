from config import config
import re
import json
import google.generativeai as genai

class AIService:
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY
        self.model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to configure Gemini: {e}")

    def analyze_email_body(self, email_body):
        """
        Analyzes the email body to extract invoice URL and sender name using Gemini.
        Returns a dict with 'url' and 'sender_name'.
        """
        if self.model:
            try:
                prompt = f"""
                You are an assistant that extracts invoice download URLs and sender names from emails.
                Return a JSON object with keys 'url' (string or null) and 'sender_name' (string or null).
                
                Email Content:
                {email_body}
                """
                
                response = self.model.generate_content(
                    prompt, 
                    generation_config={"response_mime_type": "application/json"}
                )
                
                return json.loads(response.text)
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Fallback: Regex extraction
        print("Using fallback regex extraction.")
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        urls = re.findall(url_pattern, email_body)
        url = urls[0] if urls else None
        
        # Simple sender guess (not accurate, just a placeholder)
        sender_name = "Unknown Sender"
        
        return {"url": url, "sender_name": sender_name}
