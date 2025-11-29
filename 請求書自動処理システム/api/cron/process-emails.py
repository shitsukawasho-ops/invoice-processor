from flask import jsonify
import os
from main import process_single_email
from services.email_service import EmailService

def handler(request):
    """
    Vercel Cron handler for automatic email processing.
    Called every 10 minutes by Vercel Cron.
    """
    # Verify request is from Vercel Cron
    auth_header = request.headers.get('Authorization', '')
    cron_secret = os.environ.get('CRON_SECRET', 'default-secret-change-me')
    
    if auth_header != f'Bearer {cron_secret}':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        email_service = EmailService()
        emails = email_service.fetch_emails()
        
        if not emails:
            return jsonify({
                'status': 'success',
                'message': 'No unread emails to process',
                'processed': 0
            })
        
        results = []
        for email in emails:
            try:
                result = process_single_email(email)
                results.append({
                    'email_id': email['id'],
                    'subject': email['subject'],
                    'status': result.get('status', 'unknown')
                })
            except Exception as e:
                results.append({
                    'email_id': email.get('id', 'unknown'),
                    'subject': email.get('subject', 'unknown'),
                    'status': 'error',
                    'error': str(e)
                })
        
        return jsonify({
            'status': 'success',
            'processed': len(results),
            'results': results
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

