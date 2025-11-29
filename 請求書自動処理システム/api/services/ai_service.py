from config import config
import re
import json
import base64
import os
import google.generativeai as genai

class AIService:
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY
        self.model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to configure Gemini: {e}")

    def analyze_email_body(self, email_body):
        """
        Analyzes the email body to extract invoice URL and company name using Gemini.
        Returns a dict with 'url' and 'company_name'.
        """
        if self.model:
            try:
                prompt = f"""
                You are an assistant that extracts invoice download URLs and company names from emails.
                Return a JSON object with keys 'url' (string or null) and 'company_name' (string or null).
                
                For company_name:
                - Extract the name of the company or organization that sent this email
                - Look for company names in the signature, header, or sender information
                - Return just the company name without "株式会社" or suffixes like "Inc.", "Co.", Ltd."
                - Examples: "Amazon" (not "Amazon.co.jp"), "楽天" (not "楽天株式会社")
                
                Email Content:
                {email_body}
                """
                
                response = self.model.generate_content(
                    prompt, 
                    generation_config={"response_mime_type": "application/json"}
                )
                
                return json.loads(response.text)
            except Exception as e:
                print(f"Gemini API error: {e}")
        
        # Fallback: Regex extraction
        print("Using fallback regex extraction.")
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        urls = re.findall(url_pattern, email_body)
        url = urls[0] if urls else None
        
        # Improved company name guess
        company_name = "Unknown Company"
        
        # Try to find "株式会社..."
        match = re.search(r'(株式会社\s*\S+)', email_body)
        if match:
            company_name = match.group(1).replace("株式会社", "").strip()
        else:
            # Try to find "...株式会社"
            match = re.search(r'(\S+\s*株式会社)', email_body)
            if match:
                company_name = match.group(1).replace("株式会社", "").strip()
        
        return {"url": url, "company_name": company_name}

    def analyze_email_with_pdf(self, email_body, pdf_path=None):
        """
        メール本文とPDFの両方を解析して会社名を抽出
        PDFがある場合はPDFの内容を優先的に解析
        """
        if self.model and pdf_path and os.path.exists(pdf_path):
            try:
                print(f"[AIService] Analyzing email with PDF: {pdf_path}")
                
                # PDFをBase64エンコード
                with open(pdf_path, 'rb') as f:
                    pdf_data = base64.b64encode(f.read()).decode()
                
                prompt = """
                以下のメール本文とPDF請求書を解析して、請求書を発行した会社名を特定してください。
                
                優先順位:
                1. PDFの請求書に記載されている発行元の会社名（最優先）
                2. メール本文の署名に記載されている会社名
                3. メールの送信者情報
                
                会社名は「株式会社」「合同会社」「有限会社」などの法人格を除いた名称のみを返してください。
                例: 「株式会社楝」→「楝」、「Amazon Japan合同会社」→「Amazon」
                
                JSON形式で返してください: {"company_name": "会社名", "url": "PDFダウンロードURL or null"}
                
                メール本文:
                """ + email_body
                
                # Gemini APIにPDFと一緒に送信
                response = self.model.generate_content(
                    [
                        prompt,
                        {
                            "mime_type": "application/pdf",
                            "data": pdf_data
                        }
                    ],
                    generation_config={"response_mime_type": "application/json"}
                )
                
                result = json.loads(response.text)
                print(f"[AIService] PDF analysis result: {result}")
                return result
                
            except Exception as e:
                print(f"[AIService] Error analyzing PDF with Gemini: {e}")
                import traceback
                traceback.print_exc()
        
        # PDFがない場合、または解析に失敗した場合は従来の方法
        return self.analyze_email_body(email_body)
