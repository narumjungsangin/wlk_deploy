'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import LogoImage from '@/components/LogoImage';
import { Menu, X, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import type { NavItem } from '@/types';
import { CATEGORIES } from '@/lib/categories';

const ADMIN_EMAILS = ['joonst26@gmail.com', 'purepsy@gmail.com'];

const NAV_MENUS: NavItem[] = CATEGORIES.map((cat) => ({
  label: cat.label,
  href: `/${cat.slug}`,
  subItems: cat.subCategories?.map((sub) => ({
    label: sub.label,
    href: `/${cat.slug}?sub=${sub.slug}`,
  })),
}));

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <LogoImage width={200} height={64} className="h-14 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_MENUS.map((menu) => (
            <div key={menu.label} className="relative group">
              <Link
                href={menu.href}
                className="flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                {menu.label}
                {menu.subItems && (
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-60" />
                )}
              </Link>
              {menu.subItems && (
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block">
                  <div className={`bg-white border rounded-xl shadow-lg p-2 min-w-[140px] ${menu.subItems.length > 5 ? 'grid grid-cols-2 min-w-[280px] gap-1' : 'flex flex-col gap-0.5'}`}>
                    {menu.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors whitespace-nowrap"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  관리자
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{session?.user?.name || session?.user?.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="메뉴 열기"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {NAV_MENUS.map((menu) => (
            <div key={menu.label}>
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                onClick={() =>
                  setOpenSubmenu(openSubmenu === menu.label ? null : menu.label)
                }
              >
                {menu.label}
                {menu.subItems && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openSubmenu === menu.label ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {menu.subItems && openSubmenu === menu.label && (
                <div className="ml-4 mt-1 space-y-1">
                  {menu.subItems.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className="block px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 rounded"
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-2 border-t flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {session?.user?.name || session?.user?.email}
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    관리자 대시보드
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center px-3 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setMobileOpen(false)}
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
