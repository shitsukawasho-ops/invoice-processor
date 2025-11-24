from google_auth_oauthlib.flow import InstalledAppFlow
from config import config
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

def main():
    print("Starting manual authentication...")
    print(f"Looking for credentials in: {config.GOOGLE_CREDENTIALS_FILE}")
    
    if not os.path.exists(config.GOOGLE_CREDENTIALS_FILE):
        print(f"Error: {config.GOOGLE_CREDENTIALS_FILE} not found.")
        return

    flow = InstalledAppFlow.from_client_secrets_file(
        config.GOOGLE_CREDENTIALS_FILE, SCOPES)
    
    # Use run_console to allow user to copy-paste URL
    print("Please visit this URL to authorize this application:")
    auth_url, _ = flow.authorization_url(prompt='consent')
    print(auth_url)
    
    code = input("Enter the authorization code: ")
    flow.fetch_token(code=code)
    creds = flow.credentials
    
    with open(config.GOOGLE_TOKEN_FILE, 'w') as token:
        token.write(creds.to_json())
    
    print("Authentication successful!")
    print(f"Token saved to {config.GOOGLE_TOKEN_FILE}")

if __name__ == "__main__":
    main()
