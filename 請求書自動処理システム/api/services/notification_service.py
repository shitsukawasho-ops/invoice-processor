import requests
import json
import os
from config import config

try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
except ImportError:
    WebClient = None
    SlackApiError = None

class NotificationService:
    def __init__(self):
        self.client = None
        self.webhook_url = config.SLACK_WEBHOOK_URL
        
        if config.SLACK_BOT_TOKEN and WebClient:
            self.client = WebClient(token=config.SLACK_BOT_TOKEN)
        
        self.channel_id = config.SLACK_CHANNEL_ID or "#general"

    def notify_slack(self, message, details=None):
        """
        Sends a notification to Slack via Webhook or Bot Token.
        """
        text = f"*{message}*\n"
        if details:
            for key, value in details.items():
                text += f"• *{key}*: {value}\n"

        # Method 1: Webhook (Preferred for simple notifications)
        if self.webhook_url:
            try:
                payload = {"text": text}
                response = requests.post(self.webhook_url, json=payload)
                if response.status_code == 200:
                    print(f"Slack notification sent via Webhook: {message}")
                    return
                else:
                    print(f"Error sending Slack Webhook: {response.text}")
            except Exception as e:
                print(f"Error sending Slack Webhook: {e}")

        # Method 2: Bot Token
        if self.client:
            try:
                self.client.chat_postMessage(channel=self.channel_id, text=text)
                print(f"Slack notification sent via Bot Token: {message}")
            except SlackApiError as e:
                print(f"Error sending Slack notification: {e.response['error']}")
        
        if not self.webhook_url and not self.client:
            print(f"[MOCK] Slack Notification: {text}")

    def notify_slack_with_file(self, message, details=None, file_path=None):
        """
        Slackにファイル付きで通知を送信
        """
        # テキストメッセージを作成
        text = f"*{message}*\n"
        if details:
            for key, value in details.items():
                text += f"• *{key}*: {value}\n"
        
        # Webhook URLでテキストを送信
        if self.webhook_url:
            try:
                payload = {"text": text}
                response = requests.post(self.webhook_url, json=payload)
                if response.status_code == 200:
                    print(f"Slack notification sent via Webhook: {message}")
            except Exception as e:
                print(f"Error sending Slack Webhook: {e}")
        
        # Bot Tokenでファイルをアップロード
        if self.client and file_path and os.path.exists(file_path):
            try:
                print(f"[NotificationService] Uploading file to Slack: {file_path}")
                response = self.client.files_upload_v2(
                    channel=self.channel_id,
                    file=file_path,
                    initial_comment=text,
                    filename=os.path.basename(file_path)
                )
                print(f"Slack file uploaded successfully: {file_path}")
            except Exception as e:
                print(f"Error uploading file to Slack: {e}")
                import traceback
                traceback.print_exc()
        elif not self.client:
            print(f"[MOCK] Slack File Upload: {text}")
            if file_path:
                print(f"[MOCK] Would upload file: {file_path}")
