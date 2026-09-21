'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DoctorNav } from '@/components/doctor/DoctorNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Search, 
  ChevronRight, 
  Stethoscope, 
  Activity, 
  Clock, 
  Eye, 
  AlertCircle
} from 'lucide-react';

interface PatientRecord {
  id: string;
  patient_name: string | null;
  abha_id: string | null;
  age: number | null;
  gender: string | null;
  language: string | null;
  created_at: string;
  medical_history?: any;
  latestVisit?: {
    id: string;
    created_at: string;
    symptoms?: any;
    notes?: string | null;
    ayush_assessment?: any;
    doctor_notes?: string | null;
  } | null;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayPatients: 0,
    completedAssessments: 0,
    reportsGenerated: 0,
  });
  const [recentPatients, setRecentPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1. Verify Doctor Authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/doctor-login');
          return;
        }

        setDoctor(user);

        // 2. Fetch Patients
        const { data: patients, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (patientsError) {
          console.error('Error loading patients:', patientsError);
          setErrorMsg('Failed to load patients data from database.');
        }

        const patientList: PatientRecord[] = patients || [];

        // 3. Fetch Patient Visits
        const { data: visits, error: visitsError } = await supabase
          .from('patient_visits')
          .select('*')
          .order('created_at', { ascending: false });

        if (visitsError) {
          console.error('Error loading visits:', visitsError);
        }

        const visitList = visits || [];

        // 4. Calculate Statistics
        const todayStr = new Date().toISOString().split('T')[0];
        const todayVisits = visitList.filter((v: any) => v.created_at && v.created_at.startsWith(todayStr));
        const assessmentsCompleted = visitList.filter(
          (v: any) => v.ayush_assessment && Object.keys(v.ayush_assessment).length > 0
        );
        const reportsDone = visitList.filter(
          (v: any) => (v.doctor_notes && v.doctor_notes.trim().length > 0) || (v.treatment_plan && Object.keys(v.treatment_plan).length > 0)
        );

        setStats({
          totalPatients: patientList.length,
          todayPatients: todayVisits.length > 0 ? todayVisits.length : patientList.filter((p: any) => p.created_at && p.created_at.startsWith(todayStr)).length,
          completedAssessments: assessmentsCompleted.length,
          reportsGenerated: reportsDone.length,
        });

        // 5. Map latest visit to each patient
        const mappedPatients = patientList.map((p) => {
          const patientVisits = visitList.filter((v: any) => v.patient_id === p.id);
          const latestVisit = patientVisits.length > 0 ? patientVisits[0] : null;
          return {
            ...p,
            latestVisit,
          };
        });

        setRecentPatients(mappedPatients);
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        setErrorMsg(err.message || 'Error initializing doctor dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Filter patients by search query
  const filteredPatients = recentPatients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.patient_name && p.patient_name.toLowerCase().includes(q)) ||
      (p.abha_id && p.abha_id.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-6">
        <LoadingSpinner label="Loading Doctor Dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col">
      <DoctorNav doctorEmail={doctor?.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Doctor Banner */}
        <div className="bg-gradient-to-r from-[#004f45] to-[#00695c] rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <Stethoscope className="w-8 h-8 text-white" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Welcome, Dr. {doctor?.email?.split('@')[0] || 'Physician'} 👨‍⚕️
                </h1>
                <p className="text-emerald-100 text-sm mt-0.5">
                  Logged in as <span className="font-semibold text-white">{doctor?.email}</span> • OPD Central Clinic
                </p>
              </div>
            </div>
            <p className="text-emerald-50 text-base mt-4 max-w-2xl">
              AI pre-captured histories, voice transcripts, and AYUSH Prakriti assessments are ready for clinical review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/doctor/patients"
              className="inline-flex items-center gap-2 bg-white text-[#004f45] px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 shadow-md transition"
            >
              <Users className="w-5 h-5" />
              <span>Search Patient Records</span>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Patients</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.totalPatients}</p>
              <p className="text-xs text-gray-400 mt-1">Registered in system</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5f2] flex items-center justify-center text-[#004f45]">
              <Users className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today's Patients</p>
              <p className="text-3xl font-extrabold text-[#004f45] mt-2">{stats.todayPatients}</p>
              <p className="text-xs text-gray-400 mt-1">Scheduled / arrived today</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eef6ed] flex items-center justify-center text-[#286b33]">
              <Calendar className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Assessments Completed</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-2">{stats.completedAssessments}</p>
              <p className="text-xs text-gray-400 mt-1">AYUSH Prakriti evaluated</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Activity className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Reports Generated</p>
              <p className="text-3xl font-extrabold text-purple-700 mt-2">{stats.reportsGenerated}</p>
              <p className="text-xs text-gray-400 mt-1">Clinical plans finalized</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700">
              <FileText className="w-7 h-7" />
            </div>
          </div>

        </div>

        {/* Quick Patient Search and Directory */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#004f45]" />
                Recent Patient Encounters
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Click any patient to inspect voice history, symptoms, AYUSH dosha and write treatment plans.</p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ABHA ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00695c]"
              />
            </div>
          </div>

          {/* Patients Table */}
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Patient Records Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery ? `No results matching "${searchQuery}". Try a different name or ABHA number.` : 'Patients who complete kiosk history taking will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">ABHA ID</th>
                    <th className="py-3.5 px-4">Demographics</th>
                    <th className="py-3.5 px-4">Chief Complaint / Voice Input</th>
                    <th className="py-3.5 px-4">AYUSH Assessment</th>
                    <th className="py-3.5 px-4">Last Visit</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => {
                    const chiefComplaint = 
                      patient.latestVisit?.symptoms?.chiefComplaint || 
                      patient.medical_history?.chiefComplaint || 
                      patient.latestVisit?.notes || 
                      'None specified';

                    const dominantDosha = 
                      patient.latestVisit?.ayush_assessment?.dominantDosha || 
                      patient.medical_history?.ayush?.dominantDosha;

                    const visitDate = patient.latestVisit?.created_at 
                      ? new Date(patient.latestVisit.created_at).toLocaleDateString()
                      : new Date(patient.created_at).toLocaleDateString();

                    return (
                      <tr key={patient.id} className="hover:bg-[#f9fbfb] transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#e8f5f2] text-[#004f45] flex items-center justify-center font-bold text-xs">
                              {(patient.patient_name || 'P').charAt(0).toUpperCase()}
                            </div>
                            <span>{patient.patient_name || 'Unnamed Patient'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-600">
                          {patient.abha_id ? (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                              {patient.abha_id}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Unlinked</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          <span>
                            {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <p className="truncate text-xs font-semibold text-gray-800" title={chiefComplaint}>
                            {chiefComplaint}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {dominantDosha ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                              {dominantDosha}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                          {visitDate}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          <Link
                            href={`/doctor/patient/${patient.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#004f45] text-white text-xs font-semibold hover:bg-[#00695c] shadow-sm transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Patient</span>
                          </Link>

                          <Link
                            href={`/doctor/patient/${patient.id}/report`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold border border-gray-300 transition"
                            title="Open Final Assessment Report"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                            <span>Report</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}