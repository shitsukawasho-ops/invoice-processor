import json
import os
from config import config

class MasterDataService:
    def __init__(self):
        self.mock_file = "mock_master_data.json"
        self.prod_file = "master_data_production.json"
        # For Vercel runtime updates (transient)
        self.runtime_file = "/tmp/master_data_runtime.json"
        
        # Initialize runtime file from prod file if not exists
        if not os.path.exists(self.runtime_file):
            initial_data = []
            if os.path.exists(self.prod_file):
                with open(self.prod_file, 'r') as f:
                    initial_data = json.load(f)
            elif os.path.exists(self.mock_file):
                with open(self.mock_file, 'r') as f:
                    initial_data = json.load(f)
            
            with open(self.runtime_file, 'w') as f:
                json.dump(initial_data, f)

    def get_all_rules(self):
        """Returns all master data rules."""
        if os.path.exists(self.runtime_file):
            with open(self.runtime_file, 'r') as f:
                return json.load(f)
        return []

    def add_rule(self, domain, email):
        """Adds a new rule."""
        rules = self.get_all_rules()
        rules.append({"sender_domain": domain, "mf_forward_email": email})
        with open(self.runtime_file, 'w') as f:
            json.dump(rules, f)

    def delete_rule(self, domain):
        """Deletes a rule by domain."""
        rules = self.get_all_rules()
        rules = [r for r in rules if r['sender_domain'] != domain]
        with open(self.runtime_file, 'w') as f:
            json.dump(rules, f)

    def get_forwarding_address(self, sender_identifier):
        """
        Looks up the forwarding address for the given sender (domain or email).
        Returns the email address or None.
        """
        rules = self.get_all_rules()
        
        # Simple domain matching
        domain = sender_identifier.split('@')[-1] if '@' in sender_identifier else sender_identifier
        
        for entry in rules:
            if entry['sender_domain'] in domain:
                return entry['mf_forward_email']
        
        return None
