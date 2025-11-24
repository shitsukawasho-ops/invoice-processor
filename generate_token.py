from services.email_service import EmailService

print("Starting OAuth flow...")
service = EmailService()
if service.creds:
    print("Authentication successful!")
    print("token.json has been generated.")
else:
    print("Authentication failed.")
