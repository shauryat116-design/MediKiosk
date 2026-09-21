'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Stethoscope, LayoutDashboard, Users, FileText, UserCheck, LogOut } from 'lucide-react';

interface DoctorNavProps {
  doctorEmail?: string | null;
}

export function DoctorNav({ doctorEmail }: DoctorNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/doctor-login');
  }

  const navItems = [
    { label: 'Dashboard', href: '/doctor-dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/doctor/patients', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004f45] flex items-center justify-center text-white shadow">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <Link href="/doctor-dashboard" className="text-xl font-bold text-[#004f45] flex items-center gap-2">
                Swaasth Saathi <span className="text-xs bg-[#e8f5f2] text-[#004f45] px-2 py-0.5 rounded-full font-semibold border border-[#a7d7cd]">Doctor Portal</span>
              </Link>
              <p className="text-xs text-gray-500 hidden sm:block">AI-Assisted OPD & Clinical Assessment</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/doctor-dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#004f45] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700">
              <UserCheck className="w-4 h-4 text-[#004f45]" />
              <span className="max-w-[140px] truncate font-medium">{doctorEmail || 'Dr. Authenticated'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-sm font-semibold transition"
              title="Logout from portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
