import json
import os
from config import config

class MasterDataService:
    def __init__(self):
        self.mock_file = "mock_master_data.json"
        self.prod_file = "master_data_production.json"

    def get_forwarding_address(self, sender_identifier):
        """
        Looks up the forwarding address for the given sender (domain or email).
        Returns the email address or None.
        """
        # Determine which file to use
        target_file = self.prod_file if os.path.exists(self.prod_file) else self.mock_file
        
        if os.path.exists(target_file):
            with open(target_file, 'r') as f:
                data = json.load(f)
                
            # Simple domain matching
            domain = sender_identifier.split('@')[-1] if '@' in sender_identifier else sender_identifier
            
            for entry in data:
                if entry['sender_domain'] in domain:
                    return entry['mf_forward_email']
        
        return None
