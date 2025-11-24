import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # AI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

    # Slack
    SLACK_BOT_TOKEN = os.getenv('SLACK_BOT_TOKEN')
    SLACK_CHANNEL_ID = os.getenv('SLACK_CHANNEL_ID')
    SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

    # Google
    GOOGLE_CREDENTIALS_FILE = os.getenv('GOOGLE_CREDENTIALS_FILE', 'google_credentials.json')
    GOOGLE_TOKEN_FILE = os.getenv("GOOGLE_TOKEN_FILE", "token.json")
    GOOGLE_CREDENTIALS_BASE64 = os.getenv('GOOGLE_CREDENTIALS_BASE64')
    GOOGLE_TOKEN_BASE64 = os.getenv('GOOGLE_TOKEN_BASE64')
    
    # Master Data
    MASTER_SHEET_ID = os.getenv("MASTER_SHEET_ID")
    
    # Email
    TARGET_EMAIL_ADDRESS = "billing@ouchi.inc"
    
    # AI
    OPENAI_MODEL = "gpt-4o-mini"

config = Config()
