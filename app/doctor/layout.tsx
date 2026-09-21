'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctorEmail, setDoctorEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace('/doctor-login');
          return;
        }

        setDoctorEmail(user.email || null);
      } catch (err) {
        console.error('Auth verification error:', err);
        router.replace('/doctor-login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-6">
        <LoadingSpinner label="Authenticating Doctor Portal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col">
      <DoctorNav doctorEmail={doctorEmail} />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
