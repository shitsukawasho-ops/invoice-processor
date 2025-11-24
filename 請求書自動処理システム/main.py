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
    
def process_single_email(email):
    """
    Processes a single email dictionary.
    Returns a dict with 'status' and 'logs'.
    """
    logs = []
    logs.append(f"メール処理開始: {email['subject']}")
    
    email_service = EmailService()
    ai_service = AIService()
    browser_service = BrowserService()
    master_data_service = MasterDataService()
    notification_service = NotificationService()
    
    try:
        # 1. Download PDF first (if available)
        pdf_paths = []
        if email_service.has_pdf_attachment(email):
            logs.append("添付ファイルからPDFを検出しました。")
            pdf_paths = email_service.download_attachments(email['id'])
            if pdf_paths:
                logs.append(f"{len(pdf_paths)}個のPDFファイルをダウンロードしました。")
        
        # 2. Analyze Email with PDF
        logs.append("AIによるメール解析を開始...")
        print(f"[DEBUG] Email Body: {email['body']}")
        analysis_result = ai_service.analyze_email_with_pdf(
            email['body'],
            pdf_paths[0] if pdf_paths else None
        )
        logs.append(f"解析結果: {analysis_result}")
        
        # 3. Identify Company & Forwarding Address
        logs.append("会社名の特定中...")
        company_name = analysis_result.get('company_name')
        
        if not company_name or company_name == "Unknown Company":
            error_msg = f"会社名を特定できませんでした"
            logs.append(error_msg)
            notification_service.notify_slack_with_file(
                "請求書処理エラー - 会社名不明",
                {
                    "Error": error_msg,
                    "Email": email['subject'],
                    "Sender": email['sender']
                },
                file_path=pdf_paths[0] if pdf_paths else None
            )
            return {"status": "error", "logs": logs}
             
        forwarding_address = master_data_service.get_forwarding_address(company_name)
        
        if not forwarding_address:
            error_msg = f"転送先が見つかりません: {company_name}"
            logs.append(error_msg)
            notification_service.notify_slack_with_file(
                "請求書処理エラー - マスターデータ不一致",
                {
                    "Error": error_msg,
                    "抽出した会社名": company_name,
                    "Email": email['subject'],
                    "Sender": email['sender']
                },
                file_path=pdf_paths[0] if pdf_paths else None
            )
            return {"status": "error", "logs": logs}
            
        logs.append(f"転送先を特定: {forwarding_address} (会社名: {company_name})")

        # 4. Download PDF from URL if not already downloaded
        if not pdf_paths and analysis_result.get('url'):
            logs.append(f"URLからPDFをダウンロード中: {analysis_result['url']}")
            pdf_path = browser_service.download_pdf_from_url(analysis_result['url'])
            if pdf_path:
                pdf_paths = [pdf_path]
        
        if not pdf_paths:
            error_msg = "PDFが見つかりません (添付ファイルもURLもありません)"
            logs.append(error_msg)
            notification_service.notify_slack("請求書処理エラー", {"Error": error_msg, "Email": email['subject']})
            return {"status": "error", "logs": logs}

        # 5. Send Email
        logs.append(f"メールを送信中: {forwarding_address}")
        send_result = email_service.send_email(
            to_address=forwarding_address,
            subject=f"Fwd: {email['subject']}",
            body="請求書を転送します。",
            attachments=pdf_paths if pdf_paths else None
        )
        
        logs.append(f"送信結果: {send_result}")
        print(f"[main.process_single_email] send_result = {send_result}")
        
        if not send_result:
            error_msg = "メール送信に失敗しました（Gmail APIが利用できない可能性があります）"
            logs.append(error_msg)
            notification_service.notify_slack("メール送信エラー", {
                "Error": error_msg,
                "Email": email['subject'],
                "To": forwarding_address
            })
            return {"status": "error", "logs": logs}
        
        # 5. Notify Slack
        logs.append("Slackに通知中...")
        notification_service.notify_slack("請求書を処理しました", {
            "Subject": email['subject'],
            "Sender": email['sender'],
            "Forwarded To": forwarding_address,
            "Status": "Success"
        })
        
        logs.append("処理完了")
        return {"status": "success", "logs": logs}

    except Exception as e:
        print(f"Error processing email: {e}")
        notification_service.notify_slack("システムエラー", {"Error": str(e)})
        return {"status": "error", "logs": logs + [f"Error: {str(e)}"]}

def main():
    print("Starting Invoice Processing System...")
    email_service = EmailService()
    emails = email_service.fetch_emails()
    
    for email in emails:
        print(f"Processing email: {email['subject']} (ID: {email['id']})")
        process_single_email(email)

if __name__ == "__main__":
    main()
