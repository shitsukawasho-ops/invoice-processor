from services.email_service import EmailService
from services.ai_service import AIService
from services.browser_service import BrowserService
from services.master_data_service import MasterDataService
from services.notification_service import NotificationService
from config import config

def main():
    print("Starting Invoice Processing System...")
    
    email_service = EmailService()
    ai_service = AIService()
    browser_service = BrowserService()
    master_data_service = MasterDataService()
    notification_service = NotificationService()
    
    # 1. Fetch Emails
    emails = email_service.fetch_emails()
    
    for email in emails:
        print(f"Processing email: {email['subject']} (ID: {email['id']})")
        
        # Phase 3: Forwarding Logic
        pdf_attachment = None
        sender_identifier = email['sender']
        
        # Determine PDF path and sender
        if email_service.has_pdf_attachment(email):
            print("  -> PDF found in attachment.")
            # In a real scenario, we would download/extract the attachment here.
            # For mock, we assume it's available or just pass the name.
            pdf_attachment = email['attachments'][0] 
        else:
            # Phase 2 logic result
            analysis_result = ai_service.analyze_email_body(email['body'])
            print(f"  -> AI Analysis Result: {analysis_result}")
            
            url = analysis_result.get('url')
            if url:
                print(f"  -> Found URL: {url}. Attempting download...")
                pdf_path = browser_service.download_pdf_from_url(url)
                if pdf_path:
                    print(f"  -> Download successful: {pdf_path}.")
                    pdf_attachment = pdf_path
                    # Use AI detected sender if available, or fallback to email sender
                    if analysis_result.get('sender_name') and analysis_result['sender_name'] != "Unknown Sender":
                         # This is just a name, master data might need domain. 
                         # For now we stick to email sender or try to extract domain from URL?
                         # Let's stick to email sender for lookup as per requirements Phase 3.
                         pass
                else:
                    print("  -> Download failed. Proceeding to Phase 4 (Exception).")
                    notification_service.notify_slack(
                        "Download Failed",
                        {"Subject": email['subject'], "Sender": email['sender'], "URL": url}
                    )
                    continue
            else:
                print("  -> No URL found. Proceeding to Phase 4 (Exception).")
                notification_service.notify_slack(
                    "No Invoice URL Found",
                    {"Subject": email['subject'], "Sender": email['sender'], "Body Snippet": email['body'][:100]}
                )
                continue

        # Master Data Lookup
        if pdf_attachment:
            print(f"  -> Proceeding to Master Data Lookup for sender: {sender_identifier}")
            forwarding_address = master_data_service.get_forwarding_address(sender_identifier)
            
            if forwarding_address:
                print(f"  -> Match found: {forwarding_address}. Forwarding email...")
                email_service.send_email(
                    to_address=forwarding_address,
                    subject=f"Fwd: {email['subject']}",
                    body="Please find the invoice attached.",
                    attachments=[pdf_attachment]
                )
                print("  -> Process Completed Successfully.")
            else:
                print("  -> No match in Master Data. Proceeding to Phase 4 (Exception).")
                notification_service.notify_slack(
                    "Master Data Mismatch",
                    {"Subject": email['subject'], "Sender": email['sender'], "Attachment": pdf_attachment}
                )

if __name__ == "__main__":
    main()
