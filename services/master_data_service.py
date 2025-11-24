import json
import os
from config import config

class MasterDataService:
    def __init__(self):
        self.mock_file = "mock_master_data.json"

    def get_forwarding_address(self, sender_identifier):
        """
        Looks up the forwarding address for the given sender (domain or email).
        Returns the email address or None.
        """
        if os.path.exists(self.mock_file):
            with open(self.mock_file, 'r') as f:
                data = json.load(f)
                
            # Simple domain matching
            domain = sender_identifier.split('@')[-1] if '@' in sender_identifier else sender_identifier
            
            for entry in data:
                if entry['sender_domain'] in domain:
                    return entry['mf_forward_email']
        
        return None
