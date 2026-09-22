const API_BASE_HOST = (typeof window !== 'undefined' && window.location && window.location.hostname) 
  ? window.location.hostname 
  : '127.0.0.1';
const API_BASE_URL = `http://${API_BASE_HOST}:8000/api/v1`;

export const KNOWN_PATIENTS = [
  {
    patientId: "PT-8841",
    fullName: "Ramesh Kumar Sharma",
    mobile: "9810123456",
    abhaNumber: "14-8892-4412-9031",
    abhaAddress: "ramesh.sharma@abdm",
    aadhaarNumber: "5481 9023 1184",
    email: "ramesh.sharma@abdm.gov.in",
    age: 42,
    gender: "Male",
    address: "B-402, Green Park, New Delhi",
    symptoms: "Low Back Pain radiating to right thigh & Stiffness",
    tokenNumber: "OPD-A-042",
    queuePosition: 3,
    department: "General Medicine (Room 104)",
    vitals: { bp: "128/82 mmHg", pulse: "76 bpm", spo2: "99%", temp: "98.4 °F" }
  },
  {
    patientId: "PT-1204",
    fullName: "Sunita Devi Patel",
    mobile: "9876543210",
    abhaNumber: "14-1234-5678-9012",
    abhaAddress: "sunita.patel@abdm",
    aadhaarNumber: "9876 5432 1098",
    email: "sunita.patel@abdm.gov.in",
    age: 38,
    gender: "Female",
    address: "Sector 14, Gurgaon, Haryana",
    symptoms: "Chronic Fatigue, Mild Anemia & Headache",
    tokenNumber: "OPD-A-018",
    queuePosition: 1,
    department: "General Medicine (Room 105)",
    vitals: { bp: "118/76 mmHg", pulse: "72 bpm", spo2: "98%", temp: "98.6 °F" }
  },
  {
    patientId: "PT-5481",
    fullName: "Sanjay Balwantrao Shinde",
    mobile: "9822334455",
    abhaNumber: "5481-9023-1184-0001",
    abhaAddress: "sanjay.shinde@abdm",
    aadhaarNumber: "1488 9244 1290",
    email: "sanjay.shinde@abdm.gov.in",
    age: 51,
    gender: "Male",
    address: "Kothrud, Pune, Maharashtra",
    symptoms: "Persistent Upper Stomach Burning & Acid Sour Belching",
    tokenNumber: "OPD-B-019",
    queuePosition: 2,
    department: "AYUSH Kayachikitsa (Room 208)",
    vitals: { bp: "130/84 mmHg", pulse: "78 bpm", spo2: "99%", temp: "98.2 °F" }
  },
  {
    patientId: "PT-1234",
    fullName: "Aadhaar Card Verified Patient",
    mobile: "9812345678",
    abhaNumber: "14-1234-5678-9000",
    abhaAddress: "aadhaar.1234@abdm",
    aadhaarNumber: "1234 5678 9000",
    email: "aadhaar.1234@abdm.gov.in",
    age: 45,
    gender: "Male",
    address: "Civil Lines, New Delhi",
    symptoms: "Aadhaar Verified OPD Consultation & Health Checkup",
    tokenNumber: "OPD-AD-900",
    queuePosition: 2,
    department: "General Medicine (Room 104)",
    vitals: { bp: "122/80 mmHg", pulse: "74 bpm", spo2: "99%", temp: "98.4 °F" }
  }
];

export const getStoredPatients = () => {
  try {
    const raw = localStorage.getItem('medikiosk_registered_patients');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveRegisteredPatient = async (patientData) => {
  const record = {
    patientId: patientData.patientId || `PT-REG-${Date.now().toString().slice(-6)}`,
    fullName: patientData.fullName || patientData.patientName || "Registered Patient",
    patientName: patientData.fullName || patientData.patientName || "Registered Patient",
    mobile: patientData.mobile || "9810000000",
    abhaNumber: patientData.abhaNumber || patientData.identifier || `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    abhaAddress: patientData.abhaAddress || `${(patientData.fullName || 'patient').toLowerCase().replace(/\s+/g, '.')}${Math.floor(10 + Math.random() * 89)}@abdm`,
    aadhaarNumber: patientData.aadhaarNumber || patientData.aadhaar || '',
    email: patientData.email || `${(patientData.fullName || 'patient').toLowerCase().replace(/\s+/g, '.')}@abdm.gov.in`,
    age: parseInt(patientData.age, 10) || 35,
    gender: patientData.gender || "Male",
    address: patientData.address || "Registered Patient Address",
    symptoms: patientData.symptoms || patientData.department || "General OPD Check-Up",
    tokenNumber: patientData.tokenNumber || `OPD-REG-${Math.floor(100 + Math.random() * 900)}`,
    queuePosition: 1,
    department: patientData.department || "General Medicine (Room 104)",
    vitals: patientData.vitals || { bp: "120/80 mmHg", pulse: "74 bpm", spo2: "99%", temp: "98.6 °F" }
  };

  try {
    await api.registerPatient(record);
  } catch (err) {
    console.warn("Backend patient registration bridge skipped, saving to edge store", err);
  }

  const stored = getStoredPatients();
  const cleanMobile = record.mobile.replace(/[\s-]/g, '');
  const cleanAadhaar = record.aadhaarNumber ? record.aadhaarNumber.replace(/[\s-]/g, '') : '';
  const cleanAbha = record.abhaNumber ? record.abhaNumber.replace(/[\s-]/g, '') : '';

  const idx = stored.findIndex(p => 
    (cleanMobile && p.mobile && p.mobile.replace(/[\s-]/g, '') === cleanMobile) ||
    (cleanAadhaar && p.aadhaarNumber && p.aadhaarNumber.replace(/[\s-]/g, '') === cleanAadhaar) ||
    (cleanAbha && p.abhaNumber && p.abhaNumber.replace(/[\s-]/g, '') === cleanAbha)
  );

  if (idx >= 0) {
    stored[idx] = { ...stored[idx], ...record };
  } else {
    stored.unshift(record);
  }

  try {
    localStorage.setItem('medikiosk_registered_patients', JSON.stringify(stored));
  } catch (e) {}

  return record;
};

export const getStoredDoctors = () => {
  try {
    const raw = localStorage.getItem('medikiosk_registered_doctors');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveRegisteredDoctor = async (doctorData) => {
  const docId = doctorData.id || doctorData.doctorId || `doc-${Date.now()}`;
  const stream = doctorData.stream || (doctorData.department && doctorData.department.toLowerCase().includes('ayu') ? 'ayush' : 'allopathy');
  const record = {
    id: docId,
    doctorId: docId,
    name: doctorData.name || "Dr. Registered Specialist",
    avatar: doctorData.avatar || "DR",
    degrees: doctorData.degrees || (stream === 'ayush' ? "BAMS, MD" : "MBBS, MD"),
    specialty: doctorData.specialty || (stream === 'ayush' ? "Ayurvedic Physician" : "Consultant Physician"),
    institution: doctorData.institution || "National Health Authority Verified Center",
    experience: doctorData.experience || "Verified Specialist",
    council: doctorData.council || (stream === 'ayush' ? "NCISM" : "National Medical Commission"),
    regNumber: doctorData.regNumber || doctorData.reg_number || `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    hprId: doctorData.hprId || doctorData.hpr_id || `${docId}@hpr.abdm`,
    stream: stream,
    department: doctorData.department || (stream === 'ayush' ? "Ayurvedic OPD & Panchakarma" : "General Medicine"),
    roomNumber: doctorData.roomNumber || doctorData.room_number || "OPD Room 105",
    shift: doctorData.shift || "Morning OPD (08:00 - 14:00)",
    status: doctorData.status || "Available",
    bio: doctorData.bio || "Newly registered clinical specialist.",
    clinicalBadgeColor: stream === 'ayush' ? "emerald" : "blue",
    isNewlyAdded: true
  };

  try {
    await api.registerDoctor(record);
  } catch (err) {
    console.warn("Backend doctor registration bridge skipped, saving to edge store", err);
  }

  const stored = getStoredDoctors();
  const idx = stored.findIndex(d => 
    (d.id && d.id === record.id) || 
    (d.doctorId && d.doctorId === record.id) ||
    (d.name && d.name.toLowerCase().trim() === record.name.toLowerCase().trim())
  );

  if (idx >= 0) {
    stored[idx] = { ...stored[idx], ...record };
  } else {
    stored.unshift(record);
  }

  try {
    localStorage.setItem('medikiosk_registered_doctors', JSON.stringify(stored));
  } catch (e) {}

  return record;
};

export const getPatientByIdentifier = (identifier, method) => {
  const stored = getStoredPatients();
  const allPatients = [...stored, ...KNOWN_PATIENTS];

  if (!identifier) return allPatients[0];
  const clean = identifier.replace(/[\s-]/g, '').toLowerCase();

  if (method === 'aadhaar') {
    const match = allPatients.find(p => p.aadhaarNumber && p.aadhaarNumber.replace(/[\s-]/g, '').toLowerCase() === clean);
    if (match) return { ...match, method: 'aadhaar', identifier };
  } else if (method === 'abha') {
    const match = allPatients.find(p => 
      (p.abhaNumber && p.abhaNumber.replace(/[\s-]/g, '').toLowerCase() === clean) || 
      (p.abhaAddress && p.abhaAddress.toLowerCase() === clean)
    );
    if (match) return { ...match, method: 'abha', identifier };
  } else if (method === 'email') {
    const match = allPatients.find(p => 
      (p.email && p.email.toLowerCase() === clean) || 
      (p.abhaAddress && p.abhaAddress.toLowerCase() === clean)
    );
    if (match) return { ...match, method: 'email', identifier };
  }

  const match = allPatients.find(p => 
    (p.aadhaarNumber && p.aadhaarNumber.replace(/[\s-]/g, '').toLowerCase() === clean) ||
    (p.abhaNumber && p.abhaNumber.replace(/[\s-]/g, '').toLowerCase() === clean) ||
    (p.abhaAddress && p.abhaAddress.toLowerCase() === clean) ||
    (p.mobile && p.mobile.replace(/[\s-]/g, '') === clean) ||
    (p.email && p.email.toLowerCase() === clean)
  );
  if (match) return { ...match, method, identifier };

  return {
    patientId: `PT-${clean.slice(-4) || '8841'}`,
    fullName: `Verified Patient (${identifier})`,
    patientName: `Verified Patient (${identifier})`,
    identifier,
    method,
    abhaAddress: `${clean}@abdm`,
    email: identifier.includes('@') ? identifier : `${clean}@abdm.gov.in`,
    age: 40,
    gender: "Male",
    tokenNumber: "OPD-A-042",
    queuePosition: 2,
    department: "General Medicine (Room 104)",
    vitals: { bp: "120/80 mmHg", pulse: "75 bpm", spo2: "98%", temp: "98.6 °F" }
  };
};

async function request(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeout = options.timeout || 8000;
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: options.signal || controller.signal,
      ...options
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.detail || errorBody.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check hospital network.');
    }
    throw err;
  }
}

export const api = {
  // --- Patient Auth & Kiosk ---
  verifyIdentifier: async (identifier, loginMethod = 'abha') => {
    return await request('/patient/verify-identifier', {
      method: 'POST',
      body: JSON.stringify({ identifier, loginMethod })
    });
  },

  sendOtp: async (identifier, loginMethod = 'abha', mobile = '', email = '', fullName = '') => {
    return await request('/patient/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, loginMethod, mobile, email, fullName })
    });
  },

  sendEmailOtp: async (email, fullName = '', identifier = '', loginMethod = 'abha') => {
    return await request('/patient/send-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, identifier, loginMethod })
    });
  },

  verifyOtp: async (identifier, otp, loginMethod = 'abha', email = '') => {
    return await request('/patient/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, loginMethod, email })
    });
  },

  verifyEmailOtp: async (email, code, identifier = '', loginMethod = 'abha') => {
    return await request('/patient/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, identifier, loginMethod })
    });
  },

  biometricAuth: async () => {
    return await request('/patient/biometric-auth', { method: 'POST' });
  },

  registerPatient: async (patientData) => {
    return await request('/patient/register', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  issueTicket: async (ticketRequest) => {
    return await request('/patient/issue-ticket', {
      method: 'POST',
      body: JSON.stringify(ticketRequest)
    });
  },

  // --- Patient Profile & History ---
  getPatientProfile: async (patientId) => {
    return await request(`/patient/profile/${patientId}`);
  },

  updatePatientProfile: async (patientId, payload) => {
    return await request(`/patient/profile/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getPatientHistory: async (patientId) => {
    return await request(`/patient/history/${patientId}`);
  },

  // --- Patient Appointments ---
  getPatientAppointments: async (patientId) => {
    return await request(`/patient/appointments/${patientId}`);
  },

  bookAppointment: async (payload) => {
    return await request('/patient/appointments/book', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getAvailableDoctors: async () => {
    return await request('/patient/doctors/available');
  },

  // --- AI Health Interview ---
  startAIInterview: async (patientId, medicalSystem = 'allopathy', language = 'english', appointmentId = null, doctorId = null) => {
    return await request('/patient/interview/start', {
      method: 'POST',
      body: JSON.stringify({ patientId, medicalSystem, language, appointmentId, doctorId })
    });
  },

  chatAIInterview: async (sessionId, patientId, message = '', selectedOption = null, language = 'english') => {
    return await request('/patient/interview/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId, patientId, message, selectedOption, language })
    });
  },

  saveAIInterview: async (payload) => {
    return await request('/patient/interview/save', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getPatientInterviews: async (patientId) => {
    return await request(`/patient/interview/${patientId}`);
  },

  // --- 3D Anatomical Pain Mapping & Digital Mannequin ---
  launchPainMapping: async (gender = 'male', patientId = 'PT-NEW') => {
    return await request('/patient/pain-mapping/launch', {
      method: 'POST',
      body: JSON.stringify({ patientGender: gender, patientId })
    });
  },

  getPainMapping: async (patientId) => {
    return await request(`/patient/pain-mapping/${patientId}`);
  },

  savePainMapping: async (payload) => {
    return await request('/patient/pain-mapping/save', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Medical Documents & OCR Scanner ---
  saveSampleDocument: async (patientId, sampleType = 'PRESCRIPTION') => {
    return await request('/patient/documents/save-sample', {
      method: 'POST',
      body: JSON.stringify({ patientId, sampleType })
    });
  },

  getPatientDocuments: async (patientId) => {
    return await request(`/patient/documents/${patientId}`);
  },

  // --- Doctor OPD Portal ---
  doctorLogin: async (doctorId, pin = '1234') => {
    return await request('/doctor/login', {
      method: 'POST',
      body: JSON.stringify({ doctorId, pin })
    });
  },

  registerDoctor: async (doctorData) => {
    return await request('/doctor/register', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  },

  getDoctorList: async () => {
    return await request('/doctor/list');
  },

  getDoctorQueue: async (doctorId) => {
    return await request(`/doctor/queue/${doctorId}`);
  },

  callNextPatient: async (doctorId) => {
    return await request('/doctor/call-next', {
      method: 'POST',
      body: JSON.stringify({ doctorId })
    });
  },

  getPatientClinicalHistory: async (patientId) => {
    return await request(`/doctor/patient-history/${patientId}`);
  },

  saveConsultation: async (payload) => {
    return await request('/doctor/consultation/save', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  completeConsultation: async (ticketId, doctorId) => {
    return await request('/doctor/consultation/save', {
      method: 'POST',
      body: JSON.stringify({ ticketId, doctorId, diagnosis: "OPD Consultation Completed" })
    });
  },

  // --- Common Admin Command Center ---
  adminLogin: async (username, password) => {
    return await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  getHospitalScopedData: async (hospitalId) => {
    return await request(`/admin/hospital/${hospitalId}`);
  },

  getAllHospitals: async () => {
    return await request('/admin/hospitals');
  },

  addHospital: async (hospitalData) => {
    return await request('/admin/hospital/add', {
      method: 'POST',
      body: JSON.stringify(hospitalData)
    });
  },

  getMainCountryTelemetry: async () => {
    return await request('/admin/main-country-telemetry');
  },

  getTelemetry: async () => {
    return await request('/admin/telemetry');
  },

  rebalanceQueues: async () => {
    return await request('/admin/rebalance-queues', { method: 'POST' });
  },

  testPrintKiosk: async (kioskId) => {
    return await request('/admin/kiosk/test-print', {
      method: 'POST',
      body: JSON.stringify({ kioskId })
    });
  },

  toggleDoctorStatus: async (doctorId) => {
    return await request('/admin/doctor/status', {
      method: 'POST',
      body: JSON.stringify({ doctorId })
    });
  }
};

export default api;
