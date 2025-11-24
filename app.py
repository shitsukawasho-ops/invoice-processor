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
    from main import process_single_email
    
    # Fetch the specific email by ID
    email_service = EmailService()
    emails = email_service.fetch_emails()
    target_email = next((e for e in emails if e['id'] == email_id), None)
    
    if not target_email:
        return jsonify({"status": "error", "logs": ["Email not found"]}), 404
    
    # Use the new processing logic from main.py
    result = process_single_email(target_email)
    return jsonify(result)

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
