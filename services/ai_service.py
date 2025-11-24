from config import config
import re
import json
from openai import OpenAI
from config import config

class AIService:
    def __init__(self):
        self.client = None
        if config.OPENAI_API_KEY:
            self.client = OpenAI(api_key=config.OPENAI_API_KEY)

    def analyze_email_body(self, email_body):
        """
        Analyzes the email body to extract invoice URL and sender name.
        Returns a dict with 'url' and 'sender_name'.
        """
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=config.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an assistant that extracts invoice download URLs and sender names from emails. Return JSON with keys 'url' (string or null) and 'sender_name' (string or null)."},
                        {"role": "user", "content": f"Analyze this email:\n\n{email_body}"}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                print(f"OpenAI API error: {e}")
        
        # Fallback: Regex extraction
        print("Using fallback regex extraction.")
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        urls = re.findall(url_pattern, email_body)
        url = urls[0] if urls else None
        
        # Simple sender guess (not accurate, just a placeholder)
        sender_name = "Unknown Sender"
        
        return {"url": url, "sender_name": sender_name}
