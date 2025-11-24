from flask import Flask, render_template, jsonify, request
import json
import os
from services.email_service import EmailService
from services.ai_service import AIService
from services.browser_service import BrowserService
from services.master_data_service import MasterDataService
from services.notification_service import NotificationService
from config import config

app = Flask(__name__, template_folder='templates', static_folder='static')

# Initialize Services
email_service = EmailService()
ai_service = AIService()
browser_service = BrowserService()
master_data_service = MasterDataService()
notification_service = NotificationService()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/master-data')
def master_data_page():
    return render_template('master_data.html')

@app.route('/api/emails')
def get_emails():
    email_service = EmailService()
    emails = email_service.fetch_emails()
    return jsonify(emails)

@app.route('/api/process/<email_id>', methods=['POST'])
def process_email_route(email_id):
    # In a real app, we would fetch the specific email by ID again or pass it.
    # For now, we fetch all and find the one matching ID.
    email_service = EmailService()
    emails = email_service.fetch_emails()
    target_email = next((e for e in emails if e['id'] == email_id), None)
    
    if not target_email:
        return jsonify({"status": "error", "logs": ["Email not found"]}), 404
        
    # Run the main processing logic for this single email
    # We need to adapt main.py's logic to be callable for a single email
    # from main import process_single_email # We will refactor main.py to export this
    # result = process_single_email(target_email) # This line is commented out as process_single_email is not yet defined
    
    # For now, we'll keep the original processing logic here, adapted for a single email
    logs = []
    def log(message):
        logs.append(message)
        print(message)

    try:
        email = target_email # Use the target_email found above

        log(f"Processing email: {email['subject']}")
        
        # Phase 1: Check for PDF
        pdf_attachment = None
        sender_identifier = email['sender']
        
        if email_service.has_pdf_attachment(email):
            log("Phase 1: PDF found in attachment.")
            pdf_attachment = email['attachments'][0]
        else:
            log("Phase 1: No PDF found. Proceeding to Phase 2 (AI Analysis).")
            
            # Phase 2: AI Analysis
            analysis_result = ai_service.analyze_email_body(email['body'])
            log(f"Phase 2: AI Analysis Result: {analysis_result}")
            
            url = analysis_result.get('url')
            if url:
                log(f"Phase 2: Found URL: {url}. Attempting download...")
                pdf_path = browser_service.download_pdf_from_url(url)
                if pdf_path:
                    log(f"Phase 2: Download successful: {pdf_path}.")
                    pdf_attachment = pdf_path
                else:
                    log("Phase 2: Download failed. Proceeding to Phase 4 (Exception).")
                    notification_service.notify_slack("Download Failed", {"Subject": email['subject'], "URL": url})
                    return jsonify({"status": "exception", "logs": logs})
            else:
                log("Phase 2: No URL found. Proceeding to Phase 4 (Exception).")
                notification_service.notify_slack("No Invoice URL Found", {"Subject": email['subject']})
                return jsonify({"status": "exception", "logs": logs})

        # Phase 3: Master Data & Forwarding
        if pdf_attachment:
            log(f"Phase 3: Looking up Master Data for sender: {sender_identifier}")
            forwarding_address = master_data_service.get_forwarding_address(sender_identifier)
            
            if forwarding_address:
                log(f"Phase 3: Match found: {forwarding_address}. Forwarding email...")
                email_service.send_email(
                    to_address=forwarding_address,
                    subject=f"Fwd: {email['subject']}",
                    body="Please find the invoice attached.",
                    attachments=[pdf_attachment]
                )
                log("Phase 3: Process Completed Successfully.")
                return jsonify({"status": "success", "logs": logs})
            else:
                log("Phase 3: No match in Master Data. Proceeding to Phase 4 (Exception).")
                notification_service.notify_slack("Master Data Mismatch", {"Subject": email['subject']})
                return jsonify({"status": "exception", "logs": logs})

    except Exception as e:
        log(f"Error: {str(e)}")
        return jsonify({"status": "error", "logs": logs}), 500

@app.route('/api/master-data', methods=['GET'])
def get_master_data():
    service = MasterDataService()
    return jsonify(service.get_all_rules())

@app.route('/api/master-data', methods=['POST'])
def add_master_data():
    data = request.json
    service = MasterDataService()
    service.add_rule(data['company_name'], data['mf_forward_email'])
    return jsonify({"status": "success"})

@app.route('/api/master-data/<path:company>', methods=['DELETE'])
def delete_master_data(company):
    service = MasterDataService()
    service.delete_rule(company)
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
