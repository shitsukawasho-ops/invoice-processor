import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
    SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
    SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID")
    
    # Gmail / Google Sheets Credentials
    GOOGLE_CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
    GOOGLE_TOKEN_FILE = os.getenv("GOOGLE_TOKEN_FILE", "token.json")
    
    # Master Data
    MASTER_SHEET_ID = os.getenv("MASTER_SHEET_ID")
    
    # Email
    TARGET_EMAIL_ADDRESS = "billing@ouchi.inc"
    
    # AI
    OPENAI_MODEL = "gpt-4o-mini"

config = Config()
