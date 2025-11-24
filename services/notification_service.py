import requests
import json

class NotificationService:
    def __init__(self):
        self.client = None
        self.webhook_url = config.SLACK_WEBHOOK_URL
        
        if config.SLACK_BOT_TOKEN:
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
