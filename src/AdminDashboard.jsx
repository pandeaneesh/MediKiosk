import { analyticsData } from './data/mockAnalyticsData';
import React, { useState, useEffect } from 'react';
import api from './utils/api';
import {
  ShieldCheck,
  Activity,
  Users,
  Clock3,
  Stethoscope,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Download,
  LogOut,
  CheckCircle2,
  Printer,
  Sparkles,
  Search,
  Filter,
  Sliders,
  Bell,
  ArrowRight,
  ArrowLeft,
  Building2,
  X,
  FileText,
  Volume2,
  RotateCcw,
  BarChart3,
  LogIn,
  TrendingUp,
  MapPin,
  Calendar,
  UserCheck,
  UserPlus,
  PieChart,
  Plus,
  Phone,
  Bed,
  ExternalLink
} from 'lucide-react';

const MongoStudioViewer = () => {
  const [activeCollection, setActiveCollection] = useState('queue_tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const collectionsData = {
    queue_tickets: [
      { _id: "66dd8e19f12a1", ticketId: "MED-2172", tokenNumber: 22, patientName: "Ramesh Kumar Sharma", mobile: "9810123456", doctorId: "doc-1", department: "General Medicine", roomNumber: "OPD Room 104", status: "SEEN", issuedAt: "2026-09-06 04:36:59", syncedToCloud: true },
      { _id: "66dd8e19f12a2", ticketId: "MED-5518", tokenNumber: 20, patientName: "Ramesh Kumar Sharma", mobile: "9810123456", doctorId: "doc-1", department: "General Medicine", roomNumber: "OPD Room 104", status: "SEEN", issuedAt: "2026-09-06 10:41:21", syncedToCloud: true },
      { _id: "66dd8e19f12a3", ticketId: "MED-7927", tokenNumber: 52, patientName: "Shruti V. Deshmukh", mobile: "9820491823", doctorId: "doc-1", department: "General Medicine", roomNumber: "OPD Room 104", status: "SEEN", issuedAt: "2026-09-08 10:29:25", syncedToCloud: true },
      { _id: "66dd8e19f12a4", ticketId: "MED-6202", tokenNumber: 16, patientName: "Aman Preet Singh", mobile: "9385384929", doctorId: "doc-1", department: "General Medicine", roomNumber: "OPD Room 104", status: "SEEN", issuedAt: "2026-09-08 14:11:34", syncedToCloud: true },
      { _id: "66dd8e19f12a5", ticketId: "MED-3426", tokenNumber: 29, patientName: "Amey Kulkarni", mobile: "6789098765", doctorId: "doc-1", department: "General Medicine", roomNumber: "OPD Room 104", status: "SEEN", issuedAt: "2026-09-09 03:32:04", syncedToCloud: true },
      { _id: "66dd8e19f12a6", ticketId: "MED-4664", tokenNumber: 30, patientName: "Bob Richards", mobile: "9876543567", doctorId: "doc-1", department: "General Medicine", roomNumber: "OPD Room 104", status: "SEEN", issuedAt: "2026-09-09 03:58:18", syncedToCloud: true }
    ],
    patients: [
      { _id: "66dd8e19f201", patientId: "PT-365681-396", fullName: "Shruti V. Deshmukh", mobile: "9820491823", abhaNumber: "91-3829-1029-3810", gender: "Female", age: 34, vitals: { bp: "120/80 mmHg", spo2: "99%", pulse: "72 bpm" } },
      { _id: "66dd8e19f202", patientId: "PT-693562-917", fullName: "Aman Preet Singh", mobile: "9385384929", abhaNumber: "91-4412-8819-2041", gender: "Male", age: 41, vitals: { bp: "128/84 mmHg", spo2: "98%", pulse: "76 bpm" } },
      { _id: "66dd8e19f203", patientId: "PT-REG-23835", fullName: "Amey Kulkarni", mobile: "6789098765", abhaNumber: "91-7712-4091-8821", gender: "Male", age: 29, vitals: { bp: "118/76 mmHg", spo2: "100%", pulse: "68 bpm" } }
    ],
    local_master_doctors: [
      { _id: "66dd8e19f301", doctorId: "doc-1", name: "Dr. Rajeshwar Sharma", specialty: "Senior Consultant Physician", department: "General Medicine", roomNumber: "OPD Room 104", patientsSeen: 34, waitingCount: 0, status: "On Duty" },
      { _id: "66dd8e19f302", doctorId: "doc-2", name: "Dr. Ananya Roy", specialty: "Interventional Cardiologist", department: "Cardiology", roomNumber: "OPD Room 202", patientsSeen: 28, waitingCount: 4, status: "On Duty" },
      { _id: "66dd8e19f303", doctorId: "doc-3", name: "Dr. Vikramaditya Joshi", specialty: "Kaya Chikitsa (Ayurveda)", department: "Ayurveda OPD", roomNumber: "AYUSH Room 03", patientsSeen: 19, waitingCount: 2, status: "On Duty" }
    ],
    abdm_health_records: [
      { _id: "66dd8e19f401", recordId: "EHR-99201", patientId: "PT-365681-396", fhirResource: "DiagnosticReport", dashvidhaScore: "Vata-Pitta Prakriti", rxSummary: "Tab Paracetamol 500mg, Amoxicillin 500mg, Dashmoolarishta", syncedToAbdmGateway: true, createdAt: "2026-09-08 11:00:00" },
      { _id: "66dd8e19f402", recordId: "EHR-99202", patientId: "PT-693562-917", fhirResource: "Encounter", dashvidhaScore: "Kapha Anubandha", rxSummary: "Tab Cetirizine 10mg, Cough Syrup 10ml TDS", syncedToAbdmGateway: true, createdAt: "2026-09-08 14:30:00" }
    ]
  };

  const currentDocs = collectionsData[activeCollection] || [];
  const filteredDocs = currentDocs.filter(doc => 
    JSON.stringify(doc).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-slate-100 font-sans">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-2xl shadow-inner">
            🍃
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">MongoDB Patient History Vault & Data Studio</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CLOUD REPLICA SET ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Database: <code className="text-emerald-400 font-mono">medikiosk_cloud_db</code> • URI: <code className="text-slate-300 font-mono">127.0.0.1:27017</code> • Edge Auto-Sync Active
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          {Object.keys(collectionsData).map(colName => (
            <button
              key={colName}
              type="button"
              onClick={() => { setActiveCollection(colName); setSelectedDoc(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeCollection === colName
                  ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>📁 {colName}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-[10px] font-mono">
                {collectionsData[colName].length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search BSON documents..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        <div className={selectedDoc ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Collection Documents ({filteredDocs.length})</span>
              <span>JSON / BSON Format</span>
            </div>
            
            <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
              {filteredDocs.map((doc, idx) => (
                <div
                  key={doc._id || idx}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 hover:bg-slate-900/80 transition cursor-pointer flex items-center justify-between gap-4 text-xs font-mono ${
                    selectedDoc?._id === doc._id ? 'bg-emerald-950/40 border-l-4 border-emerald-500' : ''
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">_id: {doc._id}</span>
                      {doc.status && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                          doc.status === 'SEEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {doc.status}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 truncate">
                      {doc.patientName || doc.fullName || doc.name || doc.recordId || doc.ticketId}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1 text-[11px] text-slate-400 font-sans">
                    <div>{doc.ticketId || doc.patientId || doc.doctorId}</div>
                    <div className="text-emerald-400 font-semibold">Inspect Document ›</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedDoc && (
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🔍 Document Inspector</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 overflow-x-auto max-h-[520px]">
              <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">
                {JSON.stringify(selectedDoc, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const INITIAL_DOCTOR_ROSTER = [
  {
    id: "doc-1",
    name: "Dr. Rajeshwar Sharma",
    degrees: "MBBS, MD (General Medicine)",
    institution: "AIIMS New Delhi",
    specialty: "Senior Consultant Physician",
    department: "General Medicine",
    roomNumber: "OPD Room 104",
    status: "On Duty",
    patientsSeen: 34,
    waitingCount: 8,
    shift: "08:00 - 14:00"
  },
  {
    id: "doc-2",
    name: "Dr. Arvind Mehta",
    degrees: "MBBS, MD, DM (Cardiology)",
    institution: "PGIMER Chandigarh",
    specialty: "Interventional Cardiologist",
    department: "Cardiology & Emergency",
    roomNumber: "Emergency Bay 2",
    status: "In Emergency",
    patientsSeen: 19,
    waitingCount: 3,
    shift: "Emergency On-Call"
  },
  {
    id: "doc-3",
    name: "Vaidya Ananya Deshpande",
    degrees: "BAMS, MD (Ayurveda - Kayachikitsa)",
    institution: "NIA Jaipur",
    specialty: "Chief Ayurvedic Physician",
    department: "Ayurvedic OPD & Panchakarma",
    roomNumber: "Room 208",
    status: "On Duty",
    patientsSeen: 22,
    waitingCount: 5,
    shift: "08:00 - 14:00"
  },
  {
    id: "doc-4",
    name: "Dr. Priya S. Nair",
    degrees: "MBBS, MS (Orthopedics), DNB",
    institution: "JIPMER Puducherry",
    specialty: "Consultant Orthopedic Surgeon",
    department: "Orthopedics",
    roomNumber: "OPD Room 112",
    status: "On Duty",
    patientsSeen: 27,
    waitingCount: 7,
    shift: "08:00 - 14:00"
  },
  {
    id: "doc-5",
    name: "Dr. Sunita Kulkarni",
    degrees: "MBBS, MD (Pediatrics), DCH",
    institution: "KMC Manipal",
    specialty: "Senior Consultant Pediatrician",
    department: "Pediatrics",
    roomNumber: "OPD Room 106",
    status: "On Break",
    patientsSeen: 21,
    waitingCount: 4,
    shift: "08:00 - 14:00"
  }
];

const INITIAL_KIOSKS = [
  {
    id: "K-01",
    location: "Main Gate & Casualty Entrance",
    status: "Online",
    paperLevel: 88,
    biometricStatus: "OK (STQC Certified)",
    touchscreen: "Calibrated (100%)",
    todayRegistrations: 462,
    latency: "22ms"
  },
  {
    id: "K-02",
    location: "East OPD Central Atrium",
    status: "Online",
    paperLevel: 64,
    biometricStatus: "OK (STQC Certified)",
    touchscreen: "Calibrated (100%)",
    todayRegistrations: 388,
    latency: "31ms"
  },
  {
    id: "K-03",
    location: "Maternal & Child Health Block",
    status: "Online",
    paperLevel: 92,
    biometricStatus: "OK (STQC Certified)",
    touchscreen: "Calibrated (100%)",
    todayRegistrations: 314,
    latency: "18ms"
  },
  {
    id: "K-04",
    location: "AYUSH & Rehabilitation Wing",
    status: "Online",
    paperLevel: 42,
    biometricStatus: "OK (STQC Certified)",
    touchscreen: "Calibrated (100%)",
    todayRegistrations: 264,
    latency: "25ms"
  }
];

const AdminDashboard = ({ admin, onLogout, onReturnToMenu }) => {
  const isMainAdmin = admin?.role === 'MAIN_ADMIN' || Boolean(admin?.email && (admin.email.includes('govt') || admin.email.includes('stakeholder') || admin.email.includes('director') || admin.email.includes('superadmin')));
  const [activeTab, setActiveTab] = useState(isMainAdmin ? 'national' : 'queues');
  const [doctorRoster, setDoctorRoster] = useState(INITIAL_DOCTOR_ROSTER);
  const [kiosks, setKiosks] = useState(INITIAL_KIOSKS);
  const [nationalTelemetry, setNationalTelemetry] = useState(null);
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticKiosk, setDiagnosticKiosk] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hospital States (Multi-Hospital Selection, Addition, and Instant Details)
  const [hospitalsList, setHospitalsList] = useState([
    {
      hospital_id: "HOSP-AIIMS-01",
      hospitalId: "HOSP-AIIMS-01",
      name: "AIIMS New Delhi Central Hospital",
      code: "AIIMS-DEL",
      city: "New Delhi",
      state: "Delhi",
      region: "Northern Region",
      total_beds: 2400,
      active_kiosks: 6,
      daily_patient_capacity: 8500,
      contact_number: "+91-11-26588500",
      doctorsCount: 22,
      waitingQueue: 14,
      status: "High Capacity",
      statusColor: "amber",
      kiosks: 6
    },
    {
      hospital_id: "HOSP-SJ-02",
      hospitalId: "HOSP-SJ-02",
      name: "Safdarjung Multi-Speciality Hospital",
      code: "SJH-DEL",
      city: "New Delhi",
      state: "Delhi",
      region: "Northern Region",
      total_beds: 1800,
      active_kiosks: 4,
      daily_patient_capacity: 6200,
      contact_number: "+91-11-26165060",
      doctorsCount: 18,
      waitingQueue: 11,
      status: "Moderate Load",
      statusColor: "emerald",
      kiosks: 4
    },
    {
      hospital_id: "HOSP-CIVIL-03",
      hospitalId: "HOSP-CIVIL-03",
      name: "District Civil Hospital Pune",
      code: "DCH-PUN",
      city: "Pune",
      state: "Maharashtra",
      region: "Western Region",
      total_beds: 950,
      active_kiosks: 3,
      daily_patient_capacity: 3400,
      contact_number: "+91-20-26127391",
      doctorsCount: 16,
      waitingQueue: 9,
      status: "🚨 Outbreak Alert (Dengue)",
      statusColor: "rose",
      kiosks: 3
    },
    {
      hospital_id: "HOSP-KMC-04",
      hospitalId: "HOSP-KMC-04",
      name: "Kasturba Community Health Center Manipal",
      code: "KMC-MNP",
      city: "Udupi",
      state: "Karnataka",
      region: "Southern Region",
      total_beds: 650,
      active_kiosks: 2,
      daily_patient_capacity: 2100,
      contact_number: "+91-820-2922761",
      doctorsCount: 14,
      waitingQueue: 6,
      status: "Nominal Load",
      statusColor: "emerald",
      kiosks: 2
    }
  ]);

  const [activeHospital, setActiveHospital] = useState({
    id: admin?.hospitalId || "HOSP-AIIMS-01",
    hospital_id: admin?.hospitalId || "HOSP-AIIMS-01",
    name: admin?.hospitalName || "AIIMS New Delhi Central Hospital",
    code: "AIIMS-DEL",
    city: "New Delhi",
    state: "Delhi"
  });

  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showHospitalSwitcherModal, setShowHospitalSwitcherModal] = useState(false);
  const [selectedDetailHospital, setSelectedDetailHospital] = useState(null);
  const [showHospitalDetailModal, setShowHospitalDetailModal] = useState(false);

  const [newHospitalForm, setNewHospitalForm] = useState({
    name: '',
    code: '',
    city: 'New Delhi',
    state: 'Delhi',
    region: 'Northern Region',
    total_beds: 500,
    active_kiosks: 4,
    daily_patient_capacity: 2500,
    contact_number: '+91-11-26000000',
    superintendent_name: '',
    superintendent_email: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isMainAdmin) {
        const natRes = await api.getMainCountryTelemetry();
        if (natRes) setNationalTelemetry(natRes);
      }
      const hospRes = await api.getAllHospitals();
      if (hospRes?.hospitals?.length > 0) {
        setHospitalsList(hospRes.hospitals);
      }
      const res = await api.getTelemetry();
      if (res?.telemetry) {
        if (res.telemetry.doctors?.length > 0) setDoctorRoster(res.telemetry.doctors);
        if (res.telemetry.kiosks?.length > 0) setKiosks(res.telemetry.kiosks);
      }
    } catch (err) {
      console.warn("Telemetry refresh warning:", err);
    } finally {
      setIsRefreshing(false);
    }
    showToast("Live telemetry, hospital grid, and queue counters synchronized.");
  };

  const handleAddHospitalSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanName = (newHospitalForm.name || '').trim();
    if (!cleanName) {
      showToast("Please enter hospital facility name.");
      return;
    }

    try {
      const res = await api.addHospital(newHospitalForm);
      if (res?.success && res.hospital) {
        setHospitalsList(prev => [res.hospital, ...prev.filter(h => h.hospital_id !== res.hospital.hospital_id)]);
        showToast(`✨ Hospital '${res.hospital.name}' onboarded successfully to network!`);
      } else {
        throw new Error(res?.detail || "Local fallback");
      }
    } catch (err) {
      const generatedId = `HOSP-${(newHospitalForm.code || cleanName.substring(0, 3)).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackHosp = {
        hospital_id: generatedId,
        hospitalId: generatedId,
        name: cleanName,
        code: newHospitalForm.code || "HOSP",
        city: newHospitalForm.city,
        state: newHospitalForm.state,
        region: newHospitalForm.region,
        total_beds: Number(newHospitalForm.total_beds || 500),
        active_kiosks: Number(newHospitalForm.active_kiosks || 4),
        daily_patient_capacity: Number(newHospitalForm.daily_patient_capacity || 2500),
        contact_number: newHospitalForm.contact_number || "+91-11-26000000",
        doctorsCount: 12,
        waitingQueue: 4,
        status: "Optimal",
        statusColor: "emerald"
      };
      setHospitalsList(prev => [fallbackHosp, ...prev]);
      showToast(`✨ Hospital '${fallbackHosp.name}' registered to MediKiosk network!`);
    }

    setShowAddHospitalModal(false);
    setNewHospitalForm({
      name: '',
      code: '',
      city: 'New Delhi',
      state: 'Delhi',
      region: 'Northern Region',
      total_beds: 500,
      active_kiosks: 4,
      daily_patient_capacity: 2500,
      contact_number: '+91-11-26000000',
      superintendent_name: '',
      superintendent_email: ''
    });
  };

  const handleSelectHospital = (hosp) => {
    setActiveHospital(hosp);
    setShowHospitalSwitcherModal(false);
    showToast(`✨ Switched active facility to: ${hosp.name}`);
  };

  const handleViewHospitalDetail = (hosp) => {
    setSelectedDetailHospital(hosp);
    setShowHospitalDetailModal(true);
  };

  useEffect(() => {
    handleRefresh();
  }, [admin?.role]);

  // Rebalance Queues 1-Click
  const handleRebalanceQueues = async () => {
    const res = await api.rebalanceQueues();
    if (res?.success) {
      setDoctorRoster(prev => prev.map(doc => {
        if (doc.waitingCount > 5) {
          return { ...doc, waitingCount: doc.waitingCount - 2 };
        }
        return doc;
      }));
      showToast(res.message || "⚡ Smart Queue Rebalance Triggered: Overflow diverted to Junior Resident chambers.");
    }
  };

  // Toggle Doctor Status
  const handleToggleDoctorStatus = async (docId) => {
    const res = await api.toggleDoctorStatus(docId);
    setDoctorRoster(prev => prev.map(doc => {
      if (doc.id === docId || doc.doctorId === docId) {
        const nextStatus = res?.status || (doc.status === 'On Duty' ? 'In Emergency' : doc.status === 'In Emergency' ? 'On Break' : 'On Duty');
        return { ...doc, status: nextStatus };
      }
      return doc;
    }));
    showToast("Doctor duty status updated successfully in Python Backend.");
  };

  // Run Kiosk Test Print
  const handleTestPrint = async (kioskId) => {
    const res = await api.testPrintKiosk(kioskId);
    setKiosks(prev => prev.map(k => {
      if (k.id === kioskId || k.kioskId === kioskId) {
        return { ...k, paperLevel: Math.max(0, k.paperLevel - 1) };
      }
      return k;
    }));
    showToast(res?.message || `Test thermal slip dispensed at Kiosk ${kioskId}. Hardware verified.`);
  };

  const filteredDoctors = doctorRoster.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 text-slate-800 flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* ================= TOP EXECUTIVE BAR ================= */}
      <header className="w-full max-w-7xl flex flex-wrap justify-between items-center gap-4 z-10 py-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-800 p-0.5 shadow-lg shadow-slate-900/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-400">
              <ShieldCheck size={26} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                {isMainAdmin ? "National Health Directorate" : (activeHospital?.name || admin?.hospitalName || "AIIMS New Delhi")}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-cyan-300 border border-slate-700 shadow-sm">
                {isMainAdmin ? "NATIONAL APEX COMMAND" : `${activeHospital?.code || activeHospital?.hospital_id || admin?.hospitalId || "HOSP-001"} COMMAND`}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium hidden sm:block">
              {isMainAdmin 
                ? "Ministry of Health & Family Welfare (MoHFW) • All-India Multi-Hospital Triage Fabric" 
                : `${activeHospital?.name || admin?.hospitalName || "AIIMS New Delhi"} Directorate • ABDM 2.0 Triage & Outpatient Management`}
            </p>
          </div>
        </div>

        {/* Right Controls: Refresh, Switcher, Add Hospital, Export & Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Cute Hospital Switcher Button (Shows for hospital admin when >1 hospitals exist) */}
          {!isMainAdmin && hospitalsList.length > 1 && (
            <button
              type="button"
              onClick={() => setShowHospitalSwitcherModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white rounded-2xl text-xs font-black transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 flex items-center gap-1.5 border border-white/30"
              title="Cute Hospital Switcher - Select Active Branch"
            >
              <span className="text-sm">🏥✨</span>
              <span className="truncate max-w-[130px]">{activeHospital?.code || activeHospital?.name?.split(' ')[0] || "Hospital"}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] uppercase font-mono tracking-wider font-extrabold">Switch ⇄</span>
            </button>
          )}

          {/* Add Hospital Button */}
          <button
            type="button"
            onClick={() => setShowAddHospitalModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
            title="Register New Hospital Facility to MediKiosk Network"
          >
            <Plus size={14} className="text-white" />
            <span>+ Add Hospital</span>
          </button>

          {isMainAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('mongo')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
              title="Inspect MongoDB Cloud Patient Files & History"
            >
              <FileText size={14} />
              <span>📜 MongoDB Studio</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Daily Report</span>
          </button>

          {/* Admin User Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-slate-200 rounded-xl shadow-sm text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              {admin?.avatar || 'AD'}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-extrabold text-slate-900 leading-tight">{admin?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{admin?.title || 'Superintendent'}</p>
            </div>
          </div>

          {onReturnToMenu && (
            <button
              type="button"
              onClick={onReturnToMenu}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Return to Main Menu"
            >
              <ArrowLeft size={14} />
              <span>Main Menu</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            title="Sign Out of Admin Console"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= MAIN DASHBOARD CONTAINER ================= */}
      <main className="w-full max-w-7xl my-auto py-4 z-10 space-y-6">
        
        {/* ================= 1. EXECUTIVE PULSE METRIC CARDS (5) ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Metric 1 */}
          <div className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-blue-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Today's Footfall</span>
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700"><Users size={16} /></div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">1,428</div>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                <span>↑ 18% vs yesterday</span> • <span className="text-slate-500">92% ABHA</span>
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Avg Wait Time</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><Clock3 size={16} /></div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">14.2 Mins</div>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                ↓ 64% faster than paper OPD
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-indigo-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Doctor Chambers</span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700"><Stethoscope size={16} /></div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono">18 / 22</div>
              <p className="text-[11px] font-bold text-indigo-700 mt-0.5">
                Active & Consulting Now
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Red-Flag Alerts</span>
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700"><AlertTriangle size={16} /></div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-rose-950 font-mono">6 Urgent</div>
              <p className="text-[11px] font-bold text-rose-700 mt-0.5">
                Immediate Emergency Bay Triage
              </p>
            </div>
          </div>

          {/* Metric 5 */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-cyan-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Kiosk Fleet Health</span>
              <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700"><HardDrive size={16} /></div>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-cyan-950 font-mono">4 / 4 Online</div>
              <p className="text-[11px] font-bold text-cyan-700 mt-0.5">
                100% Fleet Operational (24ms)
              </p>
            </div>
          </div>
        </div>

        {/* ================= 2. TABBED MANAGEMENT CONSOLE ================= */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-200 overflow-hidden">
          
          {/* Navigation Tab Bar */}
          <div className="px-6 sm:px-8 pt-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex gap-2 flex-wrap" aria-label="Admin console navigation">
              {(isMainAdmin ? [
                { id: 'national', label: '0. 🇮🇳 National Hospital Surveillance', icon: Building2 },
                { id: 'queues', label: '1. Live OPD Queues & Load', icon: Activity },
                { id: 'logins', label: '2. User & Login Analytics', icon: BarChart3 },
                { id: 'customers', label: '3. Customer Analytics', icon: Users },
                { id: 'roster', label: '4. Doctor in Chamber', icon: Stethoscope },
                { id: 'fleet', label: '5. Kiosk Hardware', icon: HardDrive },
                { id: 'abdm', label: '6. ABDM & DPDP Compliance', icon: ShieldCheck },
                { id: 'mongo', label: '7. 📜 MongoDB Cloud History Studio', icon: FileText }
              ] : [
                { id: 'queues', label: '1. Live OPD Queues & Load', icon: Activity },
                { id: 'customers', label: '2. Customer Analytics', icon: Users },
                { id: 'fleet', label: '3. Kiosk Hardware', icon: HardDrive },
                { id: 'roster', label: '4. Doctor in Chamber', icon: Stethoscope },
                { id: 'abdm', label: '5. ABDM & DPDP Compliance', icon: ShieldCheck }
              ]).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                      isActive
                        ? 'text-blue-700 border-blue-600 bg-white rounded-t-xl shadow-sm'
                        : 'text-slate-500 border-transparent hover:text-slate-800'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Rebalance Shortcut button */}
            {activeTab === 'queues' && (
              <button
                type="button"
                onClick={handleRebalanceQueues}
                className="mb-2 sm:mb-0 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Sliders size={13} />
                <span>⚡ Auto-Rebalance Queues</span>
              </button>
            )}
          </div>

          {/* ================= 0. NATIONAL HOSPITAL SURVEILLANCE TAB (MAIN_ADMIN) ================= */}
          {activeTab === 'national' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="text-blue-600" />
                    <span>National Multi-Hospital Surveillance & Epidemic Directorate</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live All-India hospital footfall, cross-facility load balancing, and real-time disease cluster telemetry
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['ALL', ...Array.from(new Set(hospitalsList.map(h => h.code || h.hospital_id || h.id))).slice(0, 6)].map((hId) => (
                    <button
                      key={hId}
                      type="button"
                      onClick={() => setSelectedHospitalFilter(hId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedHospitalFilter === hId
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {hId === 'ALL' ? `All India (${hospitalsList.length})` : hId}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 National Aggregate Telemetry KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-900 uppercase">
                    <span>Nationwide Footfall</span>
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-blue-950 font-mono mt-2">
                    {nationalTelemetry?.nationalFootfall || "5,420+"}
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 mt-1">↑ 14% WoW • 91% ABHA Verified</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-900 uppercase">
                    <span>National Avg Wait Time</span>
                    <Clock3 size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-950 font-mono mt-2">
                    {nationalTelemetry?.averageWaitTime || "15.2 Mins"}
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 mt-1">Target &lt; 20 min met nationwide</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold text-cyan-900 uppercase">
                    <span>Active Kiosk Network</span>
                    <HardDrive size={16} className="text-cyan-600" />
                  </div>
                  <div className="text-3xl font-black text-cyan-950 font-mono mt-2">
                    16 / 16
                  </div>
                  <p className="text-[11px] font-bold text-cyan-700 mt-1">100% Fleet Online (24ms Latency)</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-900 uppercase">
                    <span>Active Doctor Chambers</span>
                    <Stethoscope size={16} className="text-indigo-600" />
                  </div>
                  <div className="text-3xl font-black text-indigo-950 font-mono mt-2">
                    60 / 76
                  </div>
                  <p className="text-[11px] font-bold text-indigo-700 mt-1">All-India Physician Coverage</p>
                </div>
              </div>

              {/* Apex Hospital Facilities Comparison - Dynamic from hospitalsList */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">Apex Hospital Facilities Directorate ({hospitalsList.length} Connected)</h4>
                    <p className="text-[11px] text-slate-500">Click any hospital card for instant telemetry, live bed count, kiosks, and doctor chambers</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Live ABDM 2.0 Edge Sync</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospitalsList
                    .filter(h => selectedHospitalFilter === 'ALL' || h.code === selectedHospitalFilter || h.hospital_id === selectedHospitalFilter || h.id === selectedHospitalFilter)
                    .map((h) => {
                      const hospId = h.hospital_id || h.hospitalId || h.id || h.code;
                      const bedCount = h.total_beds || h.beds || 500;
                      const kioskCount = h.active_kiosks || h.kiosks || 4;
                      const footfall = h.footfall || (h.daily_patient_capacity ? Math.floor(h.daily_patient_capacity * 0.62) : 1200);
                      const abha = h.abha || 92;
                      const docCount = h.doctorsCount || h.doctors || "18 / 22";
                      const waitTime = h.wait || "14.2 min";
                      const loadPercent = h.load || (bedCount > 1000 ? 88 : 65);
                      const statusText = h.status || (loadPercent > 80 ? "High Capacity" : "Optimal Load");
                      const statusColor = h.statusColor || (statusText.includes("Outbreak") ? "rose" : loadPercent > 80 ? "amber" : "emerald");

                      return (
                        <div
                          key={hospId}
                          onClick={() => handleViewHospitalDetail(h)}
                          className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer space-y-3 group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {h.code || hospId}
                                </span>
                                <h5 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition">
                                  {h.name}
                                </h5>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {h.city}, {h.state} • {h.region || "National Health Network"}
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              statusColor === 'rose'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : statusColor === 'amber'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {statusText}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-[10px] text-slate-500 block">Total Beds</span>
                              <span className="text-sm font-black text-slate-900 font-mono">{bedCount}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-[10px] text-slate-500 block">Active Kiosks</span>
                              <span className="text-sm font-black text-blue-700 font-mono">{kioskCount}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-[10px] text-slate-500 block">Doctors</span>
                              <span className="text-sm font-black text-indigo-700 font-mono">{docCount}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-[10px] text-slate-500 block">Avg Wait</span>
                              <span className="text-sm font-black text-emerald-700 font-mono">{waitTime}</span>
                            </div>
                          </div>

                          {/* Capacity Utilization Bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                              <span>OPD & Chamber Capacity</span>
                              <span className="font-mono">{loadPercent}% Utilized</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${loadPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${loadPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick CTA Button */}
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewHospitalDetail(h);
                              }}
                              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition"
                            >
                              <span>👁️ View Immediate Live Telemetry & Details</span>
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Real-time National Disease Outbreak Radar */}
              <div className="p-5 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 rounded-2xl border-2 border-rose-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-950 font-black text-sm">
                    <AlertTriangle size={18} className="text-rose-600 animate-pulse" />
                    <span>AI Epidemiological Surveillance & Disease Outbreak Hotspots</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-extrabold uppercase">
                    National Health Radar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-rose-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between font-extrabold text-rose-900">
                      <span>Pune District Civil (Western)</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">CRITICAL</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      <strong>42 cases</strong> of high fever with retro-orbital pain & low platelets flagged by AI Interview in last 48 hrs (Dengue spike).
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between font-extrabold text-amber-900">
                      <span>AIIMS & Safdarjung (NCR)</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">ELEVATED</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      <strong>28% increase</strong> in pediatric wheezing and acute bronchospasm correlated with PM2.5 seasonal rise.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-blue-200 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between font-extrabold text-blue-900">
                      <span>KMC Manipal (Southern)</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">MONITORING</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      Post-monsoon acute viral gastroenteritis trend. 19 cases treated in AYUSH & General Medicine OPD.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inter-Hospital Smart Load Balancer Widget */}
              <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-extrabold text-cyan-300">⚡ Automated Cross-Hospital Load Balancer</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">AI-SUGGESTED</span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    AIIMS New Delhi General Medicine is at 92% capacity while Safdarjung Hospital OPD Room 104 is at 68%. Diverting 20 non-emergency walk-ins reduces Delhi NCR patient wait time by ~11.4 mins.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await handleRebalanceQueues();
                    showToast("⚡ Inter-Hospital load balanced: 20 overflow tokens rerouted across Delhi NCR network.");
                  }}
                  className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition shadow-lg shrink-0 flex items-center gap-1.5 active:scale-95"
                >
                  <Sliders size={14} />
                  <span>Execute Inter-Hospital Balance</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= USER & LOGIN ANALYTICS TAB ================= */}
          {activeTab === 'logins' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="text-blue-600" />
                    <span>User & Login Analytics</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time patient login and authentication telemetry across all hospital terminals</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold rounded-xl">
                    ● Telemetry Sync Active
                  </span>
                </div>
              </div>

              {/* 6 Core Login KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 block">Total Logins</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {analyticsData.userLoginAnalytics.totalLogins.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">+18.4% all-time</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 block">Logins This Month</span>
                  <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
                    {analyticsData.userLoginAnalytics.loginsThisMonth.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">+12.6% MoM</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 block">Logins This Week</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">
                    {analyticsData.userLoginAnalytics.loginsThisWeek.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">+8.2% WoW</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 block">Logins Today</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                    {analyticsData.userLoginAnalytics.loginsToday}
                  </span>
                  <span className="text-[11px] text-cyan-700 font-bold mt-1 block">Peak: 94 / hr</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 block">Unique Users</span>
                  <span className="text-2xl font-black text-teal-700 font-mono mt-1 block">
                    {analyticsData.userLoginAnalytics.uniqueUsersLoggedIn.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold mt-1 block">74.1% ratio</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 block">New Users (Month)</span>
                  <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
                    {analyticsData.userLoginAnalytics.newUsersThisMonth}
                  </span>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 block">+14.65% vs prev</span>
                </div>
              </div>

              {/* Method Split & Hourly Curve */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Authentication Channel Breakdown</h4>
                  <div className="space-y-3.5">
                    {analyticsData.userLoginAnalytics.methodsDistribution.map((m) => (
                      <div key={m.method} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{m.method}</span>
                          <span className="text-slate-500 font-mono"><strong>{m.count.toLocaleString()}</strong> ({m.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className={`${m.color} h-full rounded-full`} style={{ width: `${m.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Today's Hourly Intake Curve (Rush Hours: 09:00 - 11:00 AM)</h4>
                  <div className="flex items-end justify-between h-40 pt-4 border-b border-slate-200 gap-2">
                    {analyticsData.userLoginAnalytics.hourlyTraffic.map((h) => (
                      <div key={h.hour} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div className={`w-full max-w-[24px] rounded-t ${h.checkIns >= 90 ? 'bg-blue-600' : 'bg-slate-300'}`} style={{ height: `${(h.checkIns / 94) * 100}%` }} />
                        <span className="text-[10px] font-mono text-slate-500 mt-2">{h.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Streaming Feed */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Live Patient Check-In Stream</span>
                  <span className="text-blue-600">Updated Real-Time</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {analyticsData.recentActivityFeed.map((act, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-50/80 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">{act.timestamp}</span>
                        <span className="font-bold text-slate-900">{act.patientName}</span>
                        <span className="text-slate-400 font-mono hidden sm:inline">({act.identifier})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">{act.method}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">{act.token}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= CUSTOMER ANALYTICS TAB ================= */}
          {activeTab === 'customers' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Users className="text-blue-600" />
                    <span>Customer (Patient) Analytics</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cohort retention, acquisition metrics, geographic catchments, and top chronic care beneficiaries</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold rounded-xl">
                    7 Regional Catchment Zones
                  </span>
                </div>
              </div>

              {/* 10 Core Customer KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Total Customers</span>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {analyticsData.customerAnalytics.totalCustomers.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">Lifetime Hospital Registrations</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">New Customers This Month</span>
                  <div className="text-2xl font-black text-blue-600 font-mono mt-1">
                    {analyticsData.customerAnalytics.newCustomersThisMonth.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    {analyticsData.customerAnalytics.newCustomersVsPreviousMonthPercentage} vs prior month
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Active vs Inactive</span>
                  <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
                    {analyticsData.customerAnalytics.activeCustomers.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-rose-500 font-bold">
                    {analyticsData.customerAnalytics.inactiveCustomers.toLocaleString()} Inactive (&gt;90d)
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Returning Customers</span>
                  <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
                    {analyticsData.customerAnalytics.returningCustomers.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-indigo-600 font-bold">Multi-visit patients (&gt;= 2 visits)</span>
                </div>
              </div>

              {/* Retention & Acquisition Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Customer Retention Rate</span>
                    <div className="text-3xl font-black text-emerald-700 font-mono mt-1">{analyticsData.customerAnalytics.customerRetentionRate}%</div>
                    <p className="text-xs text-emerald-600 mt-1 font-semibold">Patients returning for ongoing care & consults</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xl">
                    78%
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Customer Acquisition Rate</span>
                    <div className="text-3xl font-black text-blue-700 font-mono mt-1">{analyticsData.customerAnalytics.customerAcquisitionRate}%</div>
                    <p className="text-xs text-blue-600 mt-1 font-semibold">Newly registered ABHA patients this cycle</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xl">
                    22%
                  </div>
                </div>
              </div>

              {/* Customers by Location */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Customers by Location (Catchment Demographics)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analyticsData.customerAnalytics.customersByLocation.map((loc) => (
                    <div key={loc.location} className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">{loc.location}</span>
                        <span className="text-blue-600 font-mono">{loc.patients.toLocaleString()} ({loc.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${loc.color} h-full rounded-full`} style={{ width: `${loc.percentage * 3.5}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 block">{loc.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers Directory */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Top Customers (Frequent Care Beneficiaries)</h4>
                    <p className="text-xs text-slate-500">Patients with highest recurring OPD visits</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patient, dept, ABHA..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">ABHA ID</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Total Visits</th>
                        <th className="p-3">Primary Dept</th>
                        <th className="p-3">Assigned Doctor</th>
                        <th className="p-3">Care Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyticsData.customerAnalytics.topCustomers
                        .filter(c => 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.primaryDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.abhaId.includes(searchQuery)
                        )
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-bold text-slate-900">{c.name}</td>
                            <td className="p-3 font-mono text-slate-600">{c.abhaId}</td>
                            <td className="p-3 text-slate-600">{c.location}</td>
                            <td className="p-3 font-mono font-bold text-blue-700">{c.totalVisits} visits</td>
                            <td className="p-3 text-slate-700 font-semibold">{c.primaryDepartment}</td>
                            <td className="p-3 text-slate-600">{c.assignedDoctor}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">{c.condition}</span></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 1: LIVE OPD QUEUES & LOAD ================= */}
          {activeTab === 'queues' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Live Departmental Triage Load</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time patient distribution across outpatient departments and waiting areas.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                  Auto-synced every 10 seconds
                </span>
              </div>

              {/* Departmental Progress Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* General Medicine */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">General Medicine</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Rooms 101-105
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-semibold">
                      <span>Waiting: <strong>48 Patients</strong></span>
                      <span>Chamber Load: <strong>85%</strong></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                    <span>Avg Consult: <strong>4.2 mins</strong></span>
                    <span>Completed: <strong className="text-emerald-700">112</strong></span>
                  </div>
                </div>

                {/* Cardiology & Emergency Bay */}
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      <span className="font-extrabold text-rose-950 text-sm">Cardiology & Triage</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Emergency Bays 1-3
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-rose-900 font-semibold">
                      <span>Urgent Waiting: <strong>14 Patients</strong></span>
                      <span>Bay Load: <strong>95%</strong></span>
                    </div>
                    <div className="w-full h-2.5 bg-rose-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-rose-200 flex justify-between text-xs text-slate-500">
                    <span>Avg Consult: <strong>6.5 mins</strong></span>
                    <span>Completed: <strong className="text-emerald-700">38</strong></span>
                  </div>
                </div>

                {/* Ayurvedic OPD & Panchakarma */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Ayurveda & AYUSH</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Rooms 206-209
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-emerald-900 font-semibold">
                      <span>Waiting: <strong>28 Patients</strong></span>
                      <span>Chamber Load: <strong>60%</strong></span>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs text-slate-500">
                    <span>Avg Consult: <strong>7.1 mins</strong></span>
                    <span>Completed: <strong className="text-emerald-700">54</strong></span>
                  </div>
                </div>

                {/* Orthopedics */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Orthopedics & Fracture</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Rooms 110-114
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-semibold">
                      <span>Waiting: <strong>34 Patients</strong></span>
                      <span>Chamber Load: <strong>75%</strong></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                    <span>Avg Consult: <strong>5.4 mins</strong></span>
                    <span>Completed: <strong className="text-emerald-700">68</strong></span>
                  </div>
                </div>

                {/* Pediatrics */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Pediatrics & Vaccination</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Rooms 106-109
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-semibold">
                      <span>Waiting: <strong>22 Children</strong></span>
                      <span>Chamber Load: <strong>65%</strong></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                    <span>Avg Consult: <strong>4.8 mins</strong></span>
                    <span>Completed: <strong className="text-emerald-700">49</strong></span>
                  </div>
                </div>

                {/* Triage Summary Card */}
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
                  <div>
                    <span className="font-extrabold text-blue-950 text-sm block">OPD Orchestration Summary</span>
                    <p className="text-xs text-slate-600 mt-1">
                      Kiosk pre-registration has eliminated waiting at Counter 1 and reduced patient congestion by 68%.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRebalanceQueues}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Run Smart Rebalancer
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ================= TAB 2: DOCTOR ROSTER & CHAMBERS ================= */}
          {activeTab === 'roster' && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Verified Specialist Roster</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time duty status, chamber allocations, and consult counts from DOCTOR_DIRECTORY.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctor or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-extrabold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-3.5">Doctor & Credentials</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Chamber Room</th>
                      <th className="p-3.5">Duty Status</th>
                      <th className="p-3.5">Patients Seen</th>
                      <th className="p-3.5">Waiting Queue</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDoctors.map((doc) => {
                      const isDuty = doc.status === 'On Duty';
                      const isEmergency = doc.status === 'In Emergency';
                      const isBreak = doc.status === 'On Break';

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5">
                            <strong className="text-sm font-extrabold text-slate-900 block">{doc.name}</strong>
                            <span className="text-[11px] text-blue-700 font-bold">{doc.degrees}</span>
                            <span className="text-[10px] text-slate-500 block">{doc.institution}</span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">{doc.department}</td>
                          <td className="p-3.5">
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              {doc.roomNumber}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                              isDuty 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : isEmergency
                                ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isDuty ? 'bg-emerald-500' : isEmergency ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              <span>{doc.status}</span>
                            </span>
                          </td>
                          <td className="p-3.5 font-black text-slate-900 font-mono text-sm">{doc.patientsSeen}</td>
                          <td className="p-3.5">
                            <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-mono">
                              {doc.waitingCount} in line
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleDoctorStatus(doc.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition"
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: KIOSK FLEET HARDWARE ================= */}
          {activeTab === 'fleet' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Hospital Kiosk Fleet Diagnostics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live telemetry from UIDAI STQC certified biometric scanners, thermal slip printers, and touchscreens.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Remote hardware diagnostic ping sent to all 4 kiosks. All responsive (24ms avg).");
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Activity size={13} />
                    <span>Ping All Fleet</span>
                  </button>
                </div>
              </div>

              {/* 4 Kiosks Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {kiosks.map((kiosk) => {
                  const isPaperLow = kiosk.paperLevel < 50;

                  return (
                    <div key={kiosk.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black bg-slate-900 text-cyan-300 px-2.5 py-0.5 rounded-md">
                              {kiosk.id}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-sm">{kiosk.location}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Registrations today: <strong>{kiosk.todayRegistrations}</strong></p>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>{kiosk.status}</span>
                        </span>
                      </div>

                      {/* Sensor & Telemetry Metrics */}
                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Thermal Paper</span>
                            <span className={`font-mono font-bold ${isPaperLow ? 'text-amber-600' : 'text-slate-800'}`}>
                              {kiosk.paperLevel}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full ${isPaperLow ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${kiosk.paperLevel}%` }} 
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">Biometric Sensor</span>
                          <span className="font-extrabold text-emerald-700 text-xs mt-1 block">
                            {kiosk.biometricStatus}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">Touch Display</span>
                          <span className="font-extrabold text-slate-800 text-xs mt-1 block">
                            {kiosk.touchscreen}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">Network Latency</span>
                          <span className="font-mono font-extrabold text-blue-700 text-xs mt-1 block">
                            {kiosk.latency} (Fiber NHA)
                          </span>
                        </div>
                      </div>

                      {/* Hardware Action Buttons */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleTestPrint(kiosk.id)}
                          className="w-1/2 py-2 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Printer size={13} />
                          <span>Test Print Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDiagnosticKiosk(kiosk);
                            setShowDiagnosticModal(true);
                          }}
                          className="w-1/2 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <HardDrive size={13} />
                          <span>Diagnostics</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 4: ABDM & DPDP COMPLIANCE ================= */}
          {activeTab === 'abdm' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">ABDM 2.0 & DPDP Act Statutory Governance</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consent architecture, Ayushman Bharat Health Account (ABHA) integration, and data privacy audits.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} /> 100% Statutory Compliance
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New ABHA Accounts</span>
                  <div className="text-3xl font-black font-mono text-slate-900">418</div>
                  <p className="text-xs text-slate-600">Generated via Aadhaar e-KYC & Mobile OTP at Kiosks today.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consent Tokens Granted</span>
                  <div className="text-3xl font-black font-mono text-emerald-700">1,428</div>
                  <p className="text-xs text-slate-600">Cryptographically signed under DPDP Act 2023 guidelines.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zero Commercial Sharing</span>
                  <div className="text-3xl font-black font-mono text-blue-700">100%</div>
                  <p className="text-xs text-slate-600">All data encrypted with TLS 1.3 AES-256; zero third-party leakage.</p>
                </div>
              </div>

              {/* Statutory Notice Card */}
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-blue-600" />
                  <h4 className="font-extrabold text-slate-900 text-base">Statutory ABDM Registry Verification</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The MediKiosk deployment is verified with the National Health Authority (NHA) SandBox and production M1, M2, M3 milestones. All health records exchanged with clinicians are FHIR compliant and routed through Ayushman Bharat Digital Mission gateways.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 border">NHA Gateway v2.5</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 border">FHIR Release 4</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 border">ISO 27001 Certified</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 border">DPDP Act 2023 Compliant</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: MONGODB CLOUD PATIENT HISTORY STUDIO ================= */}
          {activeTab === 'mongo' && (
            <div className="p-6">
              <MongoStudioViewer />
            </div>
          )}


        </div>

      </main>

      {/* ================= MODAL 1: EXPORT DAILY REPORT ================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download size={20} className="text-cyan-400" />
                <h3 className="font-extrabold text-lg">Hospital Daily OPD Executive Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <p className="font-extrabold text-sm uppercase">CENTRAL TERTIARY HOSPITAL & MEDICAL COLLEGE</p>
                <p className="text-[10px] text-slate-500">Government Directorate of Health & Family Welfare</p>
                <p className="text-[10px] text-slate-500">Executive OPD Operations & Telemetry Summary</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>

              <div className="space-y-2 pt-2 text-slate-800">
                <div className="flex justify-between"><span>Total Patients Registered:</span><strong>1,428</strong></div>
                <div className="flex justify-between"><span>ABHA e-KYC Verified:</span><strong>1,314 (92%)</strong></div>
                <div className="flex justify-between"><span>New ABHAs Created:</span><strong>418</strong></div>
                <div className="flex justify-between"><span>Active Doctor Chambers:</span><strong>18 of 22</strong></div>
                <div className="flex justify-between"><span>Average Wait Time:</span><strong>14.2 minutes</strong></div>
                <div className="flex justify-between"><span>Emergency Red-Flag Dispatches:</span><strong className="text-rose-700">6 (Cardiac/Acute)</strong></div>
                <div className="flex justify-between"><span>Kiosk Fleet Uptime:</span><strong>99.8%</strong></div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300">
                <p className="font-bold text-slate-900 mb-1">Departmental Breakdown:</p>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>• General Medicine:</span><span>160 Patients (48 Waiting)</span></div>
                  <div className="flex justify-between"><span>• Cardiology & Acute Triage:</span><span>52 Patients (14 Waiting)</span></div>
                  <div className="flex justify-between"><span>• Ayurvedic OPD & AYUSH:</span><span>82 Patients (28 Waiting)</span></div>
                  <div className="flex justify-between"><span>• Orthopedics:</span><span>102 Patients (34 Waiting)</span></div>
                  <div className="flex justify-between"><span>• Pediatrics:</span><span>71 Patients (22 Waiting)</span></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600">
                Certified by: <strong>{admin?.name || 'Dr. V. K. Paul, MS, FRCS'}</strong> ({admin?.title || 'Medical Superintendent'})
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowExportModal(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer size={15} />
                <span>Print Official Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: KIOSK HARDWARE DIAGNOSTICS ================= */}
      {showDiagnosticModal && diagnosticKiosk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={20} className="text-cyan-400" />
                <h3 className="font-extrabold text-lg">Diagnostics: Kiosk {diagnosticKiosk.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnosticModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Location: <strong>{diagnosticKiosk.location}</strong>
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span>Thermal Printer Mechanism</span>
                  <span className="font-bold text-emerald-700">OK (Paper {diagnosticKiosk.paperLevel}%)</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span>STQC Biometric Fingerprint Sensor</span>
                  <span className="font-bold text-emerald-700">UIDAI L0 OK</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span>Capacitive Touch Screen</span>
                  <span className="font-bold text-emerald-700">Calibrated</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span>Audio TTS Synthesis Speaker</span>
                  <span className="font-bold text-emerald-700">100% Volume Output</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span>Encrypted Gateway Ping</span>
                  <span className="font-bold text-blue-700 font-mono">{diagnosticKiosk.latency} (256-bit TLS)</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleTestPrint(diagnosticKiosk.id);
                    setShowDiagnosticModal(false);
                  }}
                  className="w-1/2 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Test Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Remote soft-reboot command sent to Kiosk ${diagnosticKiosk.id}.`);
                    setShowDiagnosticModal(false);
                  }}
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Reboot Kiosk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 1. ADD NEW HOSPITAL MODAL ================= */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Register New Hospital Facility</h3>
                  <p className="text-xs text-emerald-100">Onboard hospital to MediKiosk Edge & ABDM 2.0 Network</p>
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

            <form onSubmit={handleAddHospitalSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newHospitalForm.name}
                    onChange={(e) => setNewHospitalForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Apollo Indraprastha Hospital"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Code</label>
                    <input
                      type="text"
                      value={newHospitalForm.code}
                      onChange={(e) => setNewHospitalForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., APH-DEL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
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

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>🛡️ Automated ABDM & Edge Provisioning</span>
                </p>
                <p className="text-[11px] text-emerald-700">
                  Registration automatically provisions default kiosk hardware tokens, creates hospital admin credentials, and links to ABDM Health Facility Registry (HFR).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Save & Register Hospital</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 2. CUTE HOSPITAL SWITCHER MODAL ================= */}
      {showHospitalSwitcherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-pink-500/40 overflow-hidden text-white">
            
            {/* Cute Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-inner">
                  🌸
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black tracking-wide">Select Active Hospital</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-extrabold uppercase font-mono">
                      {hospitalsList.length} Facilities
                    </span>
                  </div>
                  <p className="text-xs text-pink-100">Click to switch current command context immediately ✨</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHospitalSwitcherModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Hospital List Cards */}
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {hospitalsList.map((hosp) => {
                const hospId = hosp.hospital_id || hosp.hospitalId || hosp.id || hosp.code;
                const isActive = (activeHospital?.hospital_id === hospId) || (activeHospital?.code === hosp.code) || (activeHospital?.name === hosp.name);

                return (
                  <div
                    key={hospId}
                    onClick={() => handleSelectHospital(hosp)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border-pink-400 shadow-lg shadow-pink-500/10 scale-[1.01]'
                        : 'bg-slate-800/80 border-slate-700/80 hover:border-pink-500/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏥</span>
                        <h4 className="font-extrabold text-sm text-white">{hosp.name}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span>✓ Active</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                        <span>📍 {hosp.city}, {hosp.state}</span>
                        <span>•</span>
                        <span className="font-mono text-cyan-300">Code: {hosp.code || hospId}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>🛏️ {hosp.total_beds || hosp.beds || 500} Beds</span>
                        <span>🖥️ {hosp.active_kiosks || hosp.kiosks || 4} Kiosks</span>
                        <span>👨‍⚕️ {hosp.doctorsCount || 18} Doctors</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHospital(hosp);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                          isActive
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'bg-slate-700 text-slate-200 hover:bg-pink-600 hover:text-white'
                        }`}
                      >
                        {isActive ? 'Current' : 'Select ›'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer in cute switcher */}
            <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-pink-400" />
                <span>Need to add another branch?</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowHospitalSwitcherModal(false);
                  setShowAddHospitalModal(true);
                }}
                className="text-xs font-bold text-pink-400 hover:text-pink-300 underline"
              >
                + Add New Hospital
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 3. IMMEDIATE HOSPITAL DETAILS MODAL ================= */}
      {showHospitalDetailModal && selectedDetailHospital && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            
            {/* Top Banner */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-cyan-300 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {selectedDetailHospital.code || selectedDetailHospital.hospital_id || selectedDetailHospital.id}
                    </span>
                    <h3 className="text-lg font-black tracking-tight">{selectedDetailHospital.name}</h3>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {selectedDetailHospital.city}, {selectedDetailHospital.state} • {selectedDetailHospital.region || "National Health Directorate"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHospitalDetailModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Telemetry Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Quick KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-blue-800 uppercase block">Total Bed Count</span>
                  <span className="text-2xl font-black text-blue-950 font-mono">
                    {selectedDetailHospital.total_beds || selectedDetailHospital.beds || 500}
                  </span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">Inpatient & ICU</span>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase block">Active Kiosks</span>
                  <span className="text-2xl font-black text-emerald-950 font-mono">
                    {selectedDetailHospital.active_kiosks || selectedDetailHospital.kiosks || 4}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">100% Online</span>
                </div>

                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-indigo-800 uppercase block">Doctors on Duty</span>
                  <span className="text-2xl font-black text-indigo-950 font-mono">
                    {selectedDetailHospital.doctorsCount || selectedDetailHospital.doctors || 18}
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">Active Consulting</span>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-amber-800 uppercase block">OPD Triage Wait</span>
                  <span className="text-2xl font-black text-amber-950 font-mono">
                    {selectedDetailHospital.wait || "14.2 min"}
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Current Avg</span>
                </div>
              </div>

              {/* Facility Specifications & Contacts */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Facility Details & Direct Telemetry</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium">Daily Outpatient Capacity</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedDetailHospital.daily_patient_capacity || 3500} Patients / Day
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium">Emergency Triage Line</span>
                    <span className="font-bold text-rose-700 font-mono flex items-center gap-1">
                      <Phone size={12} />
                      {selectedDetailHospital.contact_number || "+91-11-26588500"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium">ABDM Gateway Status</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={13} />
                      <span>Active (M2 & M3 Certified)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium">Edge DB Sync</span>
                    <span className="font-bold text-cyan-700 flex items-center gap-1">
                      <Activity size={13} />
                      <span>Sub-second Push (22ms)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectHospital(selectedDetailHospital);
                    setShowHospitalDetailModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-cyan-400" />
                  <span>Scope Admin View to This Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHospitalDetailModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-md"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-7xl flex flex-wrap justify-between items-center text-xs text-slate-600 py-3 border-t border-blue-200/80 gap-2 z-10 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Central Operations Console Live</span>
        </div>
        <span>ABDM Technical Support: <strong className="text-slate-800 font-bold">14477 (Toll-Free)</strong></span>
      </footer>

    </div>
  );
};

export default AdminDashboard;
