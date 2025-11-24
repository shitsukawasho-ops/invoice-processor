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
        Analyzes the email body to extract invoice URL and company name using Gemini.
        Returns a dict with 'url' and 'company_name'.
        """
        if self.model:
            try:
                prompt = f"""
                You are an assistant that extracts invoice download URLs and company names from emails.
                Return a JSON object with keys 'url' (string or null) and 'company_name' (string or null).
                
                For company_name:
                - Extract the name of the company or organization that sent this email
                - Look for company names in the signature, header, or sender information
                - Return just the company name without "株式会社" or suffixes like "Inc.", "Co.", Ltd."
                - Examples: "Amazon" (not "Amazon.co.jp"), "楽天" (not "楽天株式会社")
                
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
        
        # Simple company name guess (not accurate, just a placeholder)
        company_name = "Unknown Company"
        
        return {"url": url, "company_name": company_name}
