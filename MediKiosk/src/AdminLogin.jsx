import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Activity,
  Sliders,
  HardDrive,
  Globe2,
  Plus,
  X,
  Bed,
  Phone,
  Search
} from 'lucide-react';
import api from './utils/api';

const DEFAULT_HOSPITALS = [
  {
    hospital_id: "HOSP-AIIMS-01",
    hospitalId: "HOSP-AIIMS-01",
    name: "AIIMS New Delhi Central Hospital",
    code: "AIIMS-DEL",
    city: "New Delhi",
    state: "Delhi",
    region: "Northern Region",
    admin_email: "hospital.admin@medikiosk.gov.in",
    admin_password: "hosp@1234",
    total_beds: 2400,
    active_kiosks: 6
  },
  {
    hospital_id: "HOSP-SJ-02",
    hospitalId: "HOSP-SJ-02",
    name: "Safdarjung Multi-Speciality Hospital",
    code: "SJH-DEL",
    city: "New Delhi",
    state: "Delhi",
    region: "Northern Region",
    admin_email: "sjh-del.admin@medikiosk.gov.in",
    admin_password: "sjh-del@1234",
    total_beds: 1800,
    active_kiosks: 4
  },
  {
    hospital_id: "HOSP-CIVIL-03",
    hospitalId: "HOSP-CIVIL-03",
    name: "District Civil Hospital Pune",
    code: "DCH-PUN",
    city: "Pune",
    state: "Maharashtra",
    region: "Western Region",
    admin_email: "admin.civilpune@medikiosk.gov.in",
    admin_password: "pune@1234",
    total_beds: 950,
    active_kiosks: 3
  },
  {
    hospital_id: "HOSP-KMC-04",
    hospitalId: "HOSP-KMC-04",
    name: "Kasturba Community Health Center Manipal",
    code: "KMC-MNP",
    city: "Udupi",
    state: "Karnataka",
    region: "Southern Region",
    admin_email: "kmc-mnp.admin@medikiosk.gov.in",
    admin_password: "kmc-mnp@1234",
    total_beds: 650,
    active_kiosks: 2
  }
];

export const GOVT_ADMIN_ROLE = {
  id: "admin-govt-stakeholders",
  roleType: "MAIN_ADMIN",
  name: "Er. Sachin Bansal",
  title: "National Health Authority & Stakeholders Director",
  degrees: "B.Tech, Health Informatics (NHA / MoHFW)",
  email: "govt.stakeholder@abdm.gov.in",
  passcode: "govt@1234",
  hospitalId: null,
  hospitalName: "National Health Authority & Ministry Stakeholders (Country-Wide)",
  badge: "Govt / Stakeholder Admin",
  department: "National Health Authority & Stakeholders",
  avatar: "SB",
  color: "indigo",
  description: "Country-wide multi-hospital surveillance, complete 7-attribute governance telemetry, user analytics, and MongoDB cloud history studio."
};

const AdminLogin = ({ onLoginSuccess, onReturnToMenu }) => {
  const [selectedRoleType, setSelectedRoleType] = useState('HOSPITAL_ADMIN'); // 'HOSPITAL_ADMIN' | 'MAIN_ADMIN'
  const [hospitalsList, setHospitalsList] = useState(DEFAULT_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState(DEFAULT_HOSPITALS[0]);
  const [email, setEmail] = useState('hospital.admin@medikiosk.gov.in');
  const [passcode, setPasscode] = useState('hosp@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState('');

  const [newHospitalForm, setNewHospitalForm] = useState({
    name: '',
    code: '',
    city: 'New Delhi',
    state: 'Delhi',
    region: 'Northern Region',
    admin_email: '',
    admin_password: '',
    total_beds: 500,
    active_kiosks: 4,
    daily_patient_capacity: 2500,
    contact_number: '+91-11-26000000',
    superintendent_name: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch all registered hospitals from backend Edge DB on load
  const loadHospitals = async () => {
    try {
      const res = await api.getAllHospitals();
      if (res?.hospitals?.length > 0) {
        const merged = res.hospitals.map(h => {
          const code = (h.code || h.hospital_id || 'HOSP').toUpperCase();
          const cleanCode = code.replace(/[^A-Z0-9]/g, '').toLowerCase();
          return {
            ...h,
            hospital_id: h.hospital_id || h.id || `HOSP-${code}`,
            code: code,
            admin_email: h.admin_email || (code.includes('AIIMS') ? 'hospital.admin@medikiosk.gov.in' : `${cleanCode}.admin@medikiosk.gov.in`),
            admin_password: h.admin_password || (code.includes('AIIMS') ? 'hosp@1234' : `${cleanCode}@1234`)
          };
        });
        setHospitalsList(merged);
        // Default to AIIMS or first hospital
        const defaultHosp = merged.find(h => h.code?.includes('AIIMS')) || merged[0];
        if (defaultHosp && selectedRoleType === 'HOSPITAL_ADMIN') {
          setSelectedHospital(defaultHosp);
          setEmail(defaultHosp.admin_email);
          setPasscode(defaultHosp.admin_password);
        }
      }
    } catch (err) {
      console.warn("Could not load hospitals from backend, using local seed:", err);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  // Switch to Government Admin Role
  const handleSelectGovRole = () => {
    setSelectedRoleType('MAIN_ADMIN');
    setEmail(GOVT_ADMIN_ROLE.email);
    setPasscode(GOVT_ADMIN_ROLE.passcode);
    setErrorMessage('');
    showToast("🏛️ Switched to Government & Stakeholders Directorate login.");
  };

  // Switch to Hospital Admin Role & select branch
  const handleSelectHospitalBranch = (hosp) => {
    setSelectedRoleType('HOSPITAL_ADMIN');
    setSelectedHospital(hosp);
    const targetEmail = hosp.admin_email || `${(hosp.code || 'hosp').toLowerCase()}.admin@medikiosk.gov.in`;
    const targetPass = hosp.admin_password || `${(hosp.code || 'hosp').toLowerCase()}@1234`;
    setEmail(targetEmail);
    setPasscode(targetPass);
    setErrorMessage('');
    showToast(`🏥 Selected '${hosp.name}' • Dedicated email & password auto-filled.`);
  };

  // Handle adding new hospital right from login page
  const handleAddHospitalSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanName = (newHospitalForm.name || '').trim();
    if (!cleanName) {
      setErrorMessage("Please enter hospital facility name.");
      return;
    }

    const code = (newHospitalForm.code || cleanName.substring(0, 3)).toUpperCase();
    const cleanCode = code.replace(/[^A-Z0-9]/g, '').toLowerCase();
    const cleanEmail = (newHospitalForm.admin_email || `${cleanCode}.admin@medikiosk.gov.in`).trim().toLowerCase();
    const cleanPass = (newHospitalForm.admin_password || `${cleanCode}@1234`).trim();

    const payload = {
      ...newHospitalForm,
      name: cleanName,
      code,
      admin_email: cleanEmail,
      admin_password: cleanPass
    };

    try {
      const res = await api.addHospital(payload);
      const createdHosp = res?.hospital ? {
        ...res.hospital,
        admin_email: cleanEmail,
        admin_password: cleanPass
      } : {
        hospital_id: `HOSP-${code}`,
        name: cleanName,
        code,
        city: newHospitalForm.city,
        state: newHospitalForm.state,
        region: newHospitalForm.region,
        total_beds: Number(newHospitalForm.total_beds || 500),
        active_kiosks: Number(newHospitalForm.active_kiosks || 4),
        daily_patient_capacity: Number(newHospitalForm.daily_patient_capacity || 2500),
        contact_number: newHospitalForm.contact_number,
        admin_email: cleanEmail,
        admin_password: cleanPass
      };

      setHospitalsList(prev => [createdHosp, ...prev.filter(h => h.hospital_id !== createdHosp.hospital_id && h.code !== createdHosp.code)]);
      setSelectedHospital(createdHosp);
      setSelectedRoleType('HOSPITAL_ADMIN');
      setEmail(cleanEmail);
      setPasscode(cleanPass);
      setShowAddHospitalModal(false);
      showToast(`✨ Hospital '${createdHosp.name}' onboarded! Dedicated credentials set: ${cleanEmail}`);
    } catch (err) {
      console.warn("Add hospital error:", err);
      const fallbackHosp = {
        hospital_id: `HOSP-${code}`,
        name: cleanName,
        code,
        city: newHospitalForm.city,
        state: newHospitalForm.state,
        region: newHospitalForm.region,
        total_beds: Number(newHospitalForm.total_beds || 500),
        active_kiosks: Number(newHospitalForm.active_kiosks || 4),
        admin_email: cleanEmail,
        admin_password: cleanPass
      };
      setHospitalsList(prev => [fallbackHosp, ...prev]);
      setSelectedHospital(fallbackHosp);
      setSelectedRoleType('HOSPITAL_ADMIN');
      setEmail(cleanEmail);
      setPasscode(cleanPass);
      setShowAddHospitalModal(false);
      showToast(`✨ Hospital '${fallbackHosp.name}' registered with dedicated credentials: ${cleanEmail}`);
    }

    setNewHospitalForm({
      name: '',
      code: '',
      city: 'New Delhi',
      state: 'Delhi',
      region: 'Northern Region',
      admin_email: '',
      admin_password: '',
      total_beds: 500,
      active_kiosks: 4,
      daily_patient_capacity: 2500,
      contact_number: '+91-11-26000000',
      superintendent_name: ''
    });
  };

  // Login handler with support for specific hospital credentials
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (passcode || '').trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter official administrative email.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter administrative password.');
      return;
    }

    const isGov = cleanEmail.includes('govt') || cleanEmail.includes('stakeholder') || cleanEmail.includes('director') || cleanEmail.includes('superadmin') || cleanEmail.includes('nha');

    // Strict cross-password rejection check upfront
    if (isGov && (cleanPass === 'hosp@1234' || (cleanPass.endsWith('@1234') && !cleanPass.startsWith('govt')))) {
      setErrorMessage("Invalid password for Government / Stakeholder account. Hospital password cannot be used for Government portal. Official passcode is 'govt@1234'.");
      return;
    }
    if (!isGov && (cleanPass === 'govt@1234' || cleanPass === 'govt1234')) {
      setErrorMessage("Invalid password for Hospital account. Government password ('govt@1234') cannot be used for Hospital portal. Enter this hospital's specific password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.adminLogin(cleanEmail, cleanPass);
      setIsLoading(false);

      if (res && res.success && res.admin) {
        if (onLoginSuccess) {
          onLoginSuccess({
            id: res.admin.username || (isGov ? "admin-govt" : `admin-${res.admin.hospitalId || 'hospital'}`),
            name: res.admin.name || (isGov ? "Er. Sachin Bansal" : "Hospital Medical Superintendent"),
            title: res.admin.role === 'MAIN_ADMIN' ? "National Healthcare & Stakeholders Director" : "Hospital Medical Superintendent",
            role: res.admin.role || (isGov ? 'MAIN_ADMIN' : 'HOSPITAL_ADMIN'),
            hospitalId: res.admin.hospitalId || (isGov ? null : (selectedHospital?.hospital_id || "HOSP-AIIMS-01")),
            hospitalName: res.admin.hospitalName || (isGov ? "National Health Authority & Ministry Stakeholders" : (selectedHospital?.name || "AIIMS New Delhi Central Hospital")),
            email: cleanEmail,
            badge: res.admin.role === 'MAIN_ADMIN' ? "Govt / Stakeholder Admin" : "Hospital Admin",
            department: isGov ? "National Health Authority & Stakeholders" : "Executive Directorate",
            avatar: isGov ? "SB" : (selectedHospital?.code?.substring(0, 2) || "HP"),
            color: isGov ? "indigo" : "blue",
            loginTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            sessionToken: res.token || `NHA-ADM-${Math.floor(100000 + Math.random() * 900000)}`
          });
        }
        return;
      } else if (res && (res.detail || res.error)) {
        setErrorMessage(res.detail || res.error);
        return;
      }
    } catch (err) {
      console.warn("Backend admin login check encountered network error, falling back to local verification:", err);
      const backendErr = err?.response?.data?.detail || err?.response?.data?.error || err?.message || '';
      const isNetError = typeof backendErr === 'string' && (
        backendErr.toLowerCase().includes('failed to fetch') ||
        backendErr.toLowerCase().includes('network') ||
        backendErr.toLowerCase().includes('fetch') ||
        backendErr.toLowerCase().includes('timed out') ||
        backendErr.toLowerCase().includes('timeout') ||
        backendErr.toLowerCase().includes('abort') ||
        backendErr.toLowerCase().includes('load failed') ||
        backendErr.toLowerCase().includes('econnrefused') ||
        backendErr.toLowerCase().includes('http error 5')
      );

      // If it's a specific credential validation error from server, display it
      if (backendErr && !isNetError && typeof backendErr === 'string' && !backendErr.includes('404')) {
        setIsLoading(false);
        setErrorMessage(backendErr);
        return;
      }
      // If network / fetch error, smoothly fall through to offline validation
    }

    // Offline / Direct Client validation
    if (isGov) {
      if (cleanPass !== 'govt@1234' && cleanPass !== 'govt1234') {
        setIsLoading(false);
        setErrorMessage("Invalid credentials for Government & Stakeholders portal. Official passcode is 'govt@1234'.");
        return;
      }
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          id: GOVT_ADMIN_ROLE.id,
          name: GOVT_ADMIN_ROLE.name,
          title: GOVT_ADMIN_ROLE.title,
          role: 'MAIN_ADMIN',
          hospitalId: null,
          hospitalName: GOVT_ADMIN_ROLE.hospitalName,
          email: cleanEmail,
          badge: "Govt / Stakeholder Admin",
          department: GOVT_ADMIN_ROLE.department,
          avatar: "SB",
          color: "indigo",
          loginTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          sessionToken: `NHA-ADM-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }
      return;
    } else {
      // Find hospital by email or fallback to selectedHospital
      const matchedHosp = hospitalsList.find(h => (h.admin_email || '').toLowerCase() === cleanEmail) || selectedHospital;
      const expectedPass = (matchedHosp?.admin_password || 'hosp@1234').trim();

      const isValidPass = cleanPass === expectedPass || cleanPass === 'hosp@1234' || cleanPass === 'hosp1234' ||
        (matchedHosp?.code && cleanPass === `${matchedHosp.code.toLowerCase()}@1234`) ||
        (matchedHosp?.code && cleanPass === `${matchedHosp.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@1234`);

      if (!isValidPass) {
        setIsLoading(false);
        setErrorMessage(`Invalid password for ${matchedHosp?.name || 'this hospital'}. Please enter the specific password set for this hospital (${expectedPass}).`);
        return;
      }

      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          id: `admin-${matchedHosp?.hospital_id || 'hosp'}`,
          name: matchedHosp?.superintendent_name || "Hospital Medical Superintendent",
          title: "Hospital Medical Superintendent",
          role: 'HOSPITAL_ADMIN',
          hospitalId: matchedHosp?.hospital_id || "HOSP-AIIMS-01",
          hospitalName: matchedHosp?.name || "AIIMS New Delhi Central Hospital",
          email: cleanEmail,
          badge: "Hospital Admin",
          department: "Executive Directorate & Clinical Ops",
          avatar: matchedHosp?.code?.substring(0, 2) || "HP",
          color: "blue",
          loginTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          sessionToken: `NHA-ADM-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }
    }
  };

  const filteredHospitals = hospitalsList.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    (h.code && h.code.toLowerCase().includes(hospitalSearch.toLowerCase())) ||
    (h.city && h.city.toLowerCase().includes(hospitalSearch.toLowerCase())) ||
    (h.admin_email && h.admin_email.toLowerCase().includes(hospitalSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-slate-800 flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full max-w-5xl flex flex-wrap justify-between items-center gap-4 z-10 py-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-800 p-0.5 shadow-lg shadow-slate-900/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-400">
              <ShieldCheck size={26} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                MediKiosk
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-cyan-300 border border-slate-700 shadow-sm">
                COMMON ADMIN LOGIN
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium hidden sm:block">
              Single Unified Portal for Hospital Administrators & Country-Wide Government Directors
            </p>
          </div>
        </div>

        {/* Header Actions: Add Hospital & Return to Main Menu */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddHospitalModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 active:scale-95"
            title="Register New Hospital Facility & Specific Credentials"
          >
            <Plus size={15} />
            <span>+ Register New Hospital</span>
          </button>

          {onReturnToMenu && (
            <button
              type="button"
              onClick={onReturnToMenu}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 active:scale-95"
              title="Return to Main Role Selection"
            >
              <span>← Main Menu</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Admin Login Card */}
      <main className="w-full max-w-4xl my-auto py-6 z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-6 sm:px-9 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full border-[24px] border-white/5 pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-cyan-300 mb-2 border border-white/15">
                  <KeyRound size={13} />
                  <span>Authorized Hospital & Government Personnel</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Unified Administrative Sign-In
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Each hospital facility has its own dedicated email & password. Government directors log in to view national surveillance.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(true)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus size={14} />
                  <span>Add New Hospital Branch</span>
                </button>
                <span className="text-[11px] font-bold text-slate-400 block mt-1">
                  {hospitalsList.length} Connected Facilities
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-9 space-y-6">
            
            {/* 1. SELECT ADMINISTRATIVE CATEGORY (HOSPITAL VS GOVT) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sliders size={14} className="text-blue-600" />
                  <span>1. Choose Administration Portal</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">Select hospital branch or national directorate</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Hospital Admin Portal Card */}
                <div
                  onClick={() => {
                    setSelectedRoleType('HOSPITAL_ADMIN');
                    if (selectedHospital) {
                      setEmail(selectedHospital.admin_email);
                      setPasscode(selectedHospital.admin_password);
                    }
                    setErrorMessage('');
                  }}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between text-left relative ${
                    selectedRoleType === 'HOSPITAL_ADMIN'
                      ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shadow-sm ${
                        selectedRoleType === 'HOSPITAL_ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        <Building2 size={20} />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        selectedRoleType === 'HOSPITAL_ADMIN' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        Hospital Admin
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">Hospital Facility Administration</h3>
                    <p className="text-xs font-bold text-blue-700 mt-0.5">
                      {selectedHospital?.name || "AIIMS New Delhi Central Hospital"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Local doctor in chambers, live OPD queues, kiosk hardware, and ABDM compliance.
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 bg-white/70 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="truncate max-w-[170px]">Email: <strong className="text-slate-900">{selectedHospital?.admin_email || 'hospital.admin@medikiosk.gov.in'}</strong></span>
                      <span>Pass: <strong className="text-blue-700">{selectedHospital?.admin_password || 'hosp@1234'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Government Admin Portal Card */}
                <div
                  onClick={handleSelectGovRole}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between text-left ${
                    selectedRoleType === 'MAIN_ADMIN'
                      ? 'bg-indigo-50/90 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shadow-sm ${
                        selectedRoleType === 'MAIN_ADMIN' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        <Globe2 size={20} />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        selectedRoleType === 'MAIN_ADMIN' ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        Govt / Stakeholder Admin
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{GOVT_ADMIN_ROLE.name}</h3>
                    <p className="text-xs font-bold text-indigo-700 mt-0.5">{GOVT_ADMIN_ROLE.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{GOVT_ADMIN_ROLE.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 bg-white/70 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span>Email: <strong className="text-slate-900">{GOVT_ADMIN_ROLE.email}</strong></span>
                      <span>Pass: <strong className="text-indigo-700">{GOVT_ADMIN_ROLE.passcode}</strong></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. DEDICATED HOSPITAL BRANCH SELECTOR (Visible when Hospital Admin is active) */}
            {selectedRoleType === 'HOSPITAL_ADMIN' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🏥 Select Specific Hospital Branch:</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {hospitalsList.length} Connected Branches
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Each hospital has its own specific Email ID and password</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={hospitalSearch}
                        onChange={(e) => setHospitalSearch(e.target.value)}
                        placeholder="Filter hospitals..."
                        className="pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddHospitalModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Plus size={13} />
                      <span>Add Hospital</span>
                    </button>
                  </div>
                </div>

                {/* Hospital Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredHospitals.map((hosp) => {
                    const hospId = hosp.hospital_id || hosp.hospitalId || hosp.code;
                    const isSelected = selectedHospital?.hospital_id === hospId || selectedHospital?.code === hosp.code;

                    return (
                      <div
                        key={hospId}
                        onClick={() => handleSelectHospitalBranch(hosp)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between text-left ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.01]'
                            : 'bg-white hover:bg-blue-50/60 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-cyan-200' : 'bg-slate-100 text-blue-700'
                            }`}>
                              {hosp.code || 'HOSP'}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-cyan-200 flex items-center gap-0.5">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                          <h5 className="font-extrabold text-xs leading-tight line-clamp-1">
                            {hosp.name}
                          </h5>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            {hosp.city}, {hosp.state}
                          </p>
                        </div>

                        <div className={`mt-2 pt-1.5 border-t text-[10px] font-mono truncate ${
                          isSelected ? 'border-white/20 text-blue-100' : 'border-slate-100 text-slate-500'
                        }`}>
                          <div className="truncate">📧 {hosp.admin_email}</div>
                          <div>🔑 {hosp.admin_password}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. LOGIN CREDENTIALS FORM */}
            <form onSubmit={handleLogin} className="space-y-4 pt-2 border-t border-slate-200">
              
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Context Banner */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">
                  Signing into: <strong className="text-slate-900">
                    {selectedRoleType === 'MAIN_ADMIN' ? 'National Health Authority Directorate (Govt)' : `${selectedHospital?.name} (${selectedHospital?.code})`}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-blue-700 font-bold border border-blue-200 text-[10px]">
                  {selectedRoleType === 'MAIN_ADMIN' ? 'Govt Portal' : 'Hospital Portal'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Official Email */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Administrative Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. apollo.admin@medikiosk.gov.in"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Specific email registered for {selectedRoleType === 'MAIN_ADMIN' ? 'Govt' : selectedHospital?.name || 'this hospital'}
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Administrative Passcode <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter hospital specific passcode"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Specific passcode set for {selectedRoleType === 'MAIN_ADMIN' ? 'Govt: govt@1234' : `${selectedHospital?.code || 'hospital'}: ${selectedHospital?.admin_password || 'hosp@1234'}`}
                  </p>
                </div>

              </div>

              {/* Login Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  Active Facility: <strong className="text-slate-800">{selectedRoleType === 'MAIN_ADMIN' ? 'National Directorate (All Hospitals)' : selectedHospital?.name}</strong>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full sm:w-auto px-8 py-3.5 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75 ${
                    selectedRoleType === 'MAIN_ADMIN' 
                      ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/25' 
                      : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/25'
                  }`}
                >
                  <span>{isLoading ? "Authenticating..." : `Sign In to ${selectedRoleType === 'MAIN_ADMIN' ? 'Govt Directorate' : selectedHospital?.code || 'Hospital'}`}</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </form>

          </div>

        </div>
      </main>

      {/* ================= REGISTER NEW HOSPITAL FACILITY MODAL ================= */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Register New Hospital Facility</h3>
                  <p className="text-xs text-emerald-100">Add hospital branch with its dedicated Email ID and Password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHospitalModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddHospitalSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-slate-800">
              <div className="space-y-3">
                
                {/* Hospital Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newHospitalForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const codeGuess = val.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase() || 'HOSP';
                      setNewHospitalForm(prev => ({
                        ...prev,
                        name: val,
                        code: prev.code || codeGuess,
                        admin_email: prev.admin_email || `${codeGuess.toLowerCase()}.admin@medikiosk.gov.in`,
                        admin_password: prev.admin_password || `${codeGuess.toLowerCase()}@1234`
                      }));
                    }}
                    placeholder="e.g., Apollo Indraprastha Hospital"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Facility Code & Region */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={newHospitalForm.code}
                      onChange={(e) => {
                        const code = e.target.value.toUpperCase();
                        setNewHospitalForm(prev => ({
                          ...prev,
                          code,
                          admin_email: `${code.toLowerCase()}.admin@medikiosk.gov.in`,
                          admin_password: `${code.toLowerCase()}@1234`
                        }));
                      }}
                      placeholder="e.g., APOLLO-DEL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Region / Zone</label>
                    <select
                      value={newHospitalForm.region}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    >
                      <option value="Northern Region">Northern Region</option>
                      <option value="Western Region">Western Region</option>
                      <option value="Southern Region">Southern Region</option>
                      <option value="Eastern Region">Eastern Region</option>
                      <option value="Central Region">Central Region</option>
                      <option value="North-Eastern Region">North-Eastern Region</option>
                    </select>
                  </div>
                </div>

                {/* Dedicated Email & Specific Password */}
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                    <KeyRound size={14} className="text-blue-600" />
                    <span>Dedicated Hospital Admin Credentials (Specific for this facility)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specific Admin Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={newHospitalForm.admin_email}
                        onChange={(e) => setNewHospitalForm(prev => ({ ...prev, admin_email: e.target.value }))}
                        placeholder="e.g., apollo.admin@medikiosk.gov.in"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Specific Hospital Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newHospitalForm.admin_password}
                        onChange={(e) => setNewHospitalForm(prev => ({ ...prev, admin_password: e.target.value }))}
                        placeholder="e.g., apollo@1234"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    💡 This email & password will uniquely authenticate this hospital branch.
                  </p>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newHospitalForm.city}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., New Delhi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newHospitalForm.state}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="e.g., Delhi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* Beds & Kiosks */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Beds</label>
                    <input
                      type="number"
                      min="10"
                      value={newHospitalForm.total_beds}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, total_beds: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Active Kiosks</label>
                    <input
                      type="number"
                      min="1"
                      value={newHospitalForm.active_kiosks}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, active_kiosks: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Daily Capacity</label>
                    <input
                      type="number"
                      min="100"
                      value={newHospitalForm.daily_patient_capacity}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, daily_patient_capacity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Hotline & Superintendent */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Hotline</label>
                    <input
                      type="text"
                      value={newHospitalForm.contact_number}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, contact_number: e.target.value }))}
                      placeholder="+91-11-26000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Superintendent Name</label>
                    <input
                      type="text"
                      value={newHospitalForm.superintendent_name}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, superintendent_name: e.target.value }))}
                      placeholder="Dr. S. K. Verma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Register & Auto-Fill Login</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl flex flex-wrap justify-between items-center text-xs text-slate-600 py-2 border-t border-slate-200/80 gap-2 z-10 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>National Health Authority (NHA) & Digital Personal Data Protection (DPDP) 2023 Compliant</span>
        </div>
        <span>MediKiosk Central Command Node #01</span>
      </footer>

    </div>
  );
};

export default AdminLogin;
