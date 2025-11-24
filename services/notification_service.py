from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from config import config

class NotificationService:
    def __init__(self):
        self.client = None
        if config.SLACK_BOT_TOKEN:
            self.client = WebClient(token=config.SLACK_BOT_TOKEN)
        self.channel_id = config.SLACK_CHANNEL_ID or "#general"

    def notify_slack(self, message, details=None):
        """
        Sends a notification to Slack.
        """
        text = f"*{message}*\n"
        if details:
            for key, value in details.items():
                text += f"• *{key}*: {value}\n"

        if self.client:
            try:
                self.client.chat_postMessage(channel=self.channel_id, text=text)
                print(f"Slack notification sent: {message}")
            except SlackApiError as e:
                print(f"Error sending Slack notification: {e.response['error']}")
        else:
            print(f"[MOCK] Slack Notification: {text}")
