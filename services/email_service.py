import json
import os
from config import config

class EmailService:
    def __init__(self):
        self.mock_file = "mock_emails.json"

    def fetch_emails(self):
        """
        Fetches unread emails.
        Currently mocks by reading from a JSON file.
        """
        if os.path.exists(self.mock_file):
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
        Sends or forwards an email.
        """
        # TODO: Implement email sending logic
        print(f"Sending email to {to_address}")
        print(f"  Subject: {subject}")
        print(f"  Body: {body}")
        if attachments:
            print(f"  Attachments: {attachments}")
