'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Users, 
  Search, 
  Eye, 
  FileText, 
  ChevronLeft, 
  Calendar, 
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface PatientItem {
  id: string;
  patient_name: string | null;
  abha_id: string | null;
  age: number | null;
  gender: string | null;
  language: string | null;
  phone?: string | null;
  created_at: string;
  visits_count?: number;
  latestVisitDate?: string;
  latestChiefComplaint?: string;
  latestDosha?: string;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [error, setError] = useState<string | null>(null);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError(null);

      // Fetch patients
      const { data: patientRows, error: pError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      // Fetch visits to map encounter summaries
      const { data: visitRows, error: vError } = await supabase
        .from('patient_visits')
        .select('*')
        .order('created_at', { ascending: false });

      if (vError) console.warn('Could not fetch visit encounters:', vError);

      const visits = visitRows || [];

      const mapped: PatientItem[] = (patientRows || []).map((p: any) => {
        const pVisits = visits.filter((v: any) => v.patient_id === p.id);
        const latestV = pVisits.length > 0 ? pVisits[0] : null;

        return {
          id: p.id,
          patient_name: p.patient_name,
          abha_id: p.abha_id,
          age: p.age,
          gender: p.gender,
          language: p.language,
          phone: p.phone || (p as any).mobile,
          created_at: p.created_at,
          visits_count: pVisits.length,
          latestVisitDate: latestV ? latestV.created_at : p.created_at,
          latestChiefComplaint: 
            latestV?.symptoms?.chiefComplaint || 
            p.medical_history?.chiefComplaint || 
            latestV?.notes || 
            'Not recorded',
          latestDosha: 
            latestV?.ayush_assessment?.dominantDosha || 
            p.medical_history?.ayush?.dominantDosha,
        };
      });

      setPatients(mapped);
    } catch (err: any) {
      console.error('Error fetching patients list:', err);
      setError(err.message || 'Failed to load patients database');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients by search query and gender filter
  const filteredList = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.patient_name && p.patient_name.toLowerCase().includes(q)) ||
      (p.abha_id && p.abha_id.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.latestChiefComplaint && p.latestChiefComplaint.toLowerCase().includes(q));

    const matchesGender =
      filterGender === 'all' || (p.gender && p.gender.toLowerCase() === filterGender.toLowerCase());

    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/doctor-dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#004f45] transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#004f45]" />
            Patient Directory & Search
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Search patient medical records by Name, ABHA ID, or Contact number.</p>
        </div>

        <button
          onClick={fetchPatients}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search Bar & Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-3 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, ABHA Number, Mobile, or Symptoms..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00695c]"
            />
          </div>

          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00695c]"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">
          <span>Showing {filteredList.length} of {patients.length} patient records</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#004f45] hover:underline font-semibold"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner label="Loading Patient Records..." />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Patients Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery ? `No patient matches the search query "${searchQuery}".` : 'No patients registered in database yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">ABHA Number</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Chief Complaint</th>
                  <th className="py-3.5 px-4">AYUSH Prakriti</th>
                  <th className="py-3.5 px-4">Last Visit</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredList.map((patient) => {
                  const visitDateFormatted = patient.latestVisitDate
                    ? new Date(patient.latestVisitDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={patient.id} className="hover:bg-[#f9fbfb] transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#e8f5f2] text-[#004f45] flex items-center justify-center font-extrabold text-sm border border-[#a7d7cd]">
                            {(patient.patient_name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{patient.patient_name || 'Unnamed Patient'}</p>
                            <p className="text-xs text-gray-400">ID: {patient.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-600">
                        {patient.abha_id ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 font-semibold">
                            {patient.abha_id}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Unlinked</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-gray-600 text-xs font-medium">
                        <span>{patient.age ? `${patient.age} yrs` : 'Age N/A'} • {patient.gender || 'N/A'}</span>
                        <span className="block text-gray-400 uppercase text-[10px] mt-0.5">{patient.language || 'hi'}</span>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-gray-800 font-medium truncate" title={patient.latestChiefComplaint}>
                          {patient.latestChiefComplaint}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        {patient.latestDosha ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                            {patient.latestDosha}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not evaluated</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                        {visitDateFormatted}
                      </td>

                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/doctor/patient/${patient.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#004f45] text-white text-xs font-bold hover:bg-[#00695c] shadow-sm transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>

                        <Link
                          href={`/doctor/patient/${patient.id}/report`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold border border-gray-300 transition"
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

    </div>
  );
}
