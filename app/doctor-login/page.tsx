"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DEMO_DOCTOR_CONFIG } from "@/lib/config/demoCredentials";
import { Stethoscope, Sparkles, CheckCircle2, Lock, Mail, ArrowRight } from "lucide-react";

export default function DoctorLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoFilled, setDemoFilled] = useState(false);

  function handleFillDemoCredentials() {
    setEmail(DEMO_DOCTOR_CONFIG.email);
    setPassword(DEMO_DOCTOR_CONFIG.password);
    setError("");
    setDemoFilled(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push("/doctor-dashboard");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7faf8] px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#004f45] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-[#004f45]">
            Aarogyam
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Doctor Portal Login
          </p>
        </div>

        {/* Simple Demo Account Fill Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="w-full py-2.5 px-4 bg-[#f0f9f6] hover:bg-[#e0f2ec] text-[#004f45] border border-[#a7d7cd] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition duration-150 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#00695c]" />
            Use Demo Account
          </button>
          {demoFilled && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#004f45] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Demo credentials filled. Click &quot;Login as Doctor&quot; to sign in.</span>
            </div>
          )}
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDemoFilled(false);
                }}
                placeholder="doctor@aarogyam.com"
                required
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDemoFilled(false);
                }}
                placeholder="Enter password"
                required
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00695c] focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004f45] text-white py-3 rounded-xl font-semibold hover:bg-[#00695c] active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Login as Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </main>
  );
}