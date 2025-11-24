import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from config import config

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

class EmailService:
    def __init__(self):
        self.creds = None
        self.service = None
        self.mock_file = "mock_emails.json"
        
        # Authenticate
        # 1. Try local file
        if os.path.exists(config.GOOGLE_TOKEN_FILE):
            try:
                self.creds = Credentials.from_authorized_user_file(config.GOOGLE_TOKEN_FILE, SCOPES)
            except Exception as e:
                print(f"Error loading token.json: {e}")
        
        # 2. Try Env Var (Base64) - For Vercel
        elif config.GOOGLE_TOKEN_BASE64:
            try:
                import json
                token_json = base64.b64decode(config.GOOGLE_TOKEN_BASE64).decode('utf-8')
                token_info = json.loads(token_json)
                self.creds = Credentials.from_authorized_user_info(token_info, SCOPES)
                print("Loaded credentials from GOOGLE_TOKEN_BASE64")
            except Exception as e:
                print(f"Error loading token from Env Var: {e}")

        # Refresh or Login (Only if not on Vercel/Serverless where interaction is impossible)
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                try:
                    self.creds.refresh(Request())
                except Exception as e:
                    print(f"Error refreshing token: {e}")
                    self.creds = None

            # Only run local server if credentials file exists and NOT on Vercel
            if not self.creds and os.path.exists(config.GOOGLE_CREDENTIALS_FILE) and not os.environ.get('VERCEL'):
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        config.GOOGLE_CREDENTIALS_FILE, SCOPES)
                    self.creds = flow.run_local_server(port=0)
                    # Save the credentials for the next run
                    with open(config.GOOGLE_TOKEN_FILE, 'w') as token:
                        token.write(self.creds.to_json())
                except Exception as e:
                    print(f"Error during OAuth flow: {e}")
                    
        if self.creds:
            self.service = build('gmail', 'v1', credentials=self.creds)

    def fetch_emails(self):
        """
        Fetches unread emails from Gmail API (filtered to billing@ouchi.inc)
        """
        if not self.service:
            print("Gmail service not available. Using mock data.")
            return self._load_mock_emails()

        try:
            # Query for unread emails sent to billing@ouchi.inc
            #  Note: Gmail treats sub-addresses (billing@) as part of contact@
            # Using deliveredto: to match sub-addresses properly
            results = self.service.users().messages().list(
                userId='me',
                q='is:unread deliveredto:billing@ouchi.inc',
                maxResults=10
            ).execute()
            
            messages = results.get('messages', [])
            
            email_list = []
            for message in messages:
                msg = self.service.users().messages().get(userId='me', id=message['id']).execute()
                payload = msg['payload']
                headers = payload.get('headers', [])
                
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "No Subject")
                sender = next((h['value'] for h in headers if h['name'] == 'From'), "Unknown")
                
                body = ""
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part['mimeType'] == 'text/plain':
                            data = part['body'].get('data')
                            if data:
                                body += base64.urlsafe_b64decode(data).decode()
                elif 'body' in payload:
                    data = payload['body'].get('data')
                    if data:
                        body += base64.urlsafe_b64decode(data).decode()
                        
                # Attachments
                attachments = []
                # Simplified attachment detection
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part.get('filename'):
                            attachments.append(part['filename'])

                email_list.append({
                    "id": message['id'],
                    "subject": subject,
                    "sender": sender,
                    "body": body,
                    "attachments": attachments
                })
            return email_list
        except Exception as e:
            print(f"Gmail API error: {e}")
        
        # Fallback to mock
        return self._load_mock_emails()
    
    def _load_mock_emails(self):
        """Load emails from mock JSON file"""
        if os.path.exists(self.mock_file):
            import json
            with open(self.mock_file, 'r') as f:
                return json.load(f)
        return []

    def has_pdf_attachment(self, email_data):
        """
        Checks if the email has a PDF attachment.
        """
        attachments = email_data.get("attachments", [])
        for attachment in attachments:
            if attachment.lower().endswith(".pdf"):
                return True
        return False

    def send_email(self, to_address, subject, body, attachments=None):
        """
        Sends or forwards an email using Gmail API.
        """
        if self.service:
            try:
                message = MIMEMultipart()
                message['to'] = to_address
                message['subject'] = subject
                
                msg = MIMEText(body)
                message.attach(msg)
                
                # Note: Real attachment handling would require reading the file content
                # For now, we just send the text body
                
                raw = base64.urlsafe_b64decode(message.as_bytes()).decode()
                raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
                body = {'raw': raw}
                
                self.service.users().messages().send(userId='me', body=body).execute()
                print(f"Email sent to {to_address}")
                return
            except Exception as e:
                print(f"Error sending email: {e}")

        # Mock send
        print(f"Sending email to {to_address}")
        print(f"  Subject: {subject}")
        print(f"  Body: {body}")
        if attachments:
            print(f"  Attachments: {attachments}")
