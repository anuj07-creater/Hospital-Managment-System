import React, { useEffect, useState } from 'react';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Droplet,
  HeartPulse,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('B+');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dob, setDob] = useState<string>('1992-06-15');
  const [address, setAddress] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [regLoading, setRegLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients(search?: string) {
    try {
      setLoading(true);
      const data = await patientService.getPatients(search);
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(searchTerm);
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setRegLoading(true);
    try {
      const newPat = await patientService.registerPatient({
        name,
        phone,
        email,
        bloodGroup,
        gender,
        dateOfBirth: dob,
        address,
        allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
      });
      setPatients([newPat, ...patients]);
      setIsModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setAllergies('');
    } catch (err) {
      console.error('Failed to register patient:', err);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Medical Records & Identity Subsystem
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Patient Registry (MRN Database)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse registered electronic health records (EHR), blood profiles, allergies, and contact history.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Register Walk-In Patient
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, Medical Record Number (MRN), or Phone..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      {/* Patients List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Retrieving patient health records from database...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No matching patient records found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-slate-900">{pat.name}</h2>
                    <Badge variant="blue" size="sm">
                      {pat.medicalRecordNumber}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <Droplet className="w-3 h-3 text-rose-500" />
                      Blood: {pat.bloodGroup}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      {pat.gender} • DOB: {pat.dateOfBirth?.slice(0, 10)}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pat.phone} • {pat.email}</span>
                    </div>
                    {pat.address && (
                      <p className="text-[11px] text-slate-500">
                        Address: {pat.address}
                      </p>
                    )}
                  </div>

                  {pat.allergies && pat.allergies.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px] text-amber-800 font-medium">Allergies:</span>
                      <div className="flex flex-wrap gap-1">
                        {pat.allergies.map((al) => (
                          <span
                            key={al}
                            className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium"
                          >
                            {al}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right self-end md:self-center">
                  <span className="text-[11px] text-slate-400 block font-mono">
                    ID: {pat.id}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Verified EHR File
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Register New Outpatient (RHMS)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter primary demographics to generate a unique Medical Record Number (MRN).
            </p>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Deshmukh"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Drug Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={regLoading}>
                  Generate MRN & Register
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
