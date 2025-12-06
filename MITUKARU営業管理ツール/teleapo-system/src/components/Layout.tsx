'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Phone,
  Users,
  Settings,
  Upload,
  LogOut,
  Menu,
  X,
  User,
  Zap
} from 'lucide-react';
import { ReactNode, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = session?.user?.role === 'admin';

  const navItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/call-list', label: '架電リスト', icon: Phone },
  ];

  const adminItems = [
    { href: '/admin/users', label: 'ユーザー管理', icon: Users },
    { href: '/admin/settings', label: '予算設定', icon: Settings },
    { href: '/admin/import', label: 'インポート', icon: Upload },
  ];

  return (
    <div className="layout-container">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Zap size={22} />
          テレアポ管理
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">管理メニュー</div>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="user-info">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <div className="user-details">
            <div className="user-name">{session?.user?.name}</div>
            <div className="user-role">{isAdmin ? '管理者' : 'オペレーター'}</div>
          </div>
          <button
            className="btn"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="ログアウト"
            style={{
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            テレアポ管理
          </span>
          <div style={{ width: 40 }} />
        </div>
        {children}
      </main>
    </div>
  );
}
