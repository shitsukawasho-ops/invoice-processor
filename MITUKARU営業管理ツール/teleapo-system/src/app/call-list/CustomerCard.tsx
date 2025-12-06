'use client';

import Link from 'next/link';
import { Phone, Clock, Building2 } from 'lucide-react';

interface CustomerCardProps {
  customer: {
    id: number;
    company_name: string;
    contact_name: string;
    phone: string;
    status: string;
    next_action_date: string | null;
  };
  statusLabels: Record<string, string>;
}

export default function CustomerCard({ customer, statusLabels }: CustomerCardProps) {
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Link href={`/call-list/${customer.id}`} style={{ textDecoration: 'none' }}>
      <div className="customer-card">
        <div className="customer-header">
          <div>
            <div className="customer-name">
              <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem', opacity: 0.6, color: 'var(--color-primary)' }} />
              {customer.company_name}
            </div>
            <div className="customer-contact">{customer.contact_name}</div>
          </div>
          <span className={`badge badge-${customer.status}`}>
            {statusLabels[customer.status]}
          </span>
        </div>
        <div className="customer-phone">
          <Phone size={18} style={{ color: 'var(--color-primary)' }} />
          <a
            href={`tel:${customer.phone}`}
            onClick={handlePhoneClick}
            style={{ fontSize: '1.2rem', letterSpacing: '0.05em' }}
          >
            {customer.phone}
          </a>
        </div>
        {customer.next_action_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-light)', fontFamily: 'var(--font-mono)' }}>
            <Clock size={14} style={{ color: 'var(--color-secondary)' }} />
            NEXT ACTION: <span style={{ color: 'var(--color-text)' }}>{customer.next_action_date}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
