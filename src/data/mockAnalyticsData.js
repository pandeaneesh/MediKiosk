// Comprehensive Hospital & Kiosk Analytics Dataset for MediKiosk
// Covers User & Login Analytics, Customer (Patient) Analytics, Location Breakdown, and Kiosk Fleet Health

export const analyticsData = {
  hospitalName: "AIIMS New Delhi / Central Civil Hospital Hub",
  reportGeneratedAt: "2026-09-09T15:30:00+05:30",
  kioskFleetCount: 8,
  activeGates: ["Gate 01 - Main Atrium", "Gate 02 - Casualty & OPD", "Gate 03 - Pediatric Wing", "Gate 04 - Ayushman Kendra"],

  // ==========================================
  // 1. USER & LOGIN ANALYTICS
  // ==========================================
  userLoginAnalytics: {
    totalLogins: 24892,
    loginsThisMonth: 4320,
    loginsThisWeek: 1184,
    loginsToday: 286,
    uniqueUsersLoggedIn: 18450,
    newUsersThisMonth: 892,

    // Period comparison trends
    trends: {
      totalLoginsGrowth: "+18.4% vs last quarter",
      thisMonthGrowth: "+12.6% vs previous month",
      thisWeekGrowth: "+8.2% vs previous week",
      todayPeakHour: "09:30 AM - 11:00 AM (94 check-ins/hr)"
    },

    // Breakdown by check-in / login authentication method
    methodsDistribution: [
      { method: "ABHA 14-digit ID", count: 10952, percentage: 44.0, color: "bg-blue-600", textColor: "text-blue-600" },
      { method: "Aadhaar Card (OTP)", count: 7716, percentage: 31.0, color: "bg-indigo-600", textColor: "text-indigo-600" },
      { method: "Biometric Thumb Scan", count: 4480, percentage: 18.0, color: "bg-emerald-600", textColor: "text-emerald-600" },
      { method: "New Patient Walk-in", count: 1744, percentage: 7.0, color: "bg-amber-500", textColor: "text-amber-600" }
    ],

    // Hourly rush distribution across standard OPD hours (07:00 to 17:00)
    hourlyTraffic: [
      { hour: "07:00", checkIns: 18, label: "Early" },
      { hour: "08:00", checkIns: 46, label: "Opening" },
      { hour: "09:00", checkIns: 92, label: "Peak 1" },
      { hour: "10:00", checkIns: 94, label: "Peak 2" },
      { hour: "11:00", checkIns: 78, label: "Busy" },
      { hour: "12:00", checkIns: 52, label: "Midday" },
      { hour: "13:00", checkIns: 31, label: "Lunch" },
      { hour: "14:00", checkIns: 38, label: "Afternoon" },
      { hour: "15:00", checkIns: 24, label: "Late" },
      { hour: "16:00", checkIns: 12, label: "Closing" }
    ]
  },

  // ==========================================
  // 2. CUSTOMER (PATIENT) ANALYTICS
  // ==========================================
  customerAnalytics: {
    totalCustomers: 18450,
    newCustomersThisMonth: 892,
    activeCustomers: 12340, // Visited within last 90 days
    inactiveCustomers: 6110, // No visits > 90 days
    returningCustomers: 13820, // Visited >= 2 times
    previousMonthNewCustomers: 778,

    // Key Performance Ratios
    newCustomersVsPreviousMonthPercentage: "+14.65%",
    customerRetentionRate: 78.4, // % of patients returning for follow-up care
    customerAcquisitionRate: 21.6, // % of patients who are new this period

    // Top Frequent Customers (Chronic disease follow-ups, regular care)
    topCustomers: [
      {
        id: "PAT-001",
        name: "Ramesh Kumar Sharma",
        abhaId: "14-8892-4412-9031",
        age: 42,
        gender: "Male",
        location: "South Delhi (Hauz Khas)",
        totalVisits: 14,
        primaryDepartment: "Cardiology",
        assignedDoctor: "Dr. A. Verma, MD",
        lastVisitDate: "09 Sep 2026",
        status: "Active",
        condition: "Hypertension Follow-up"
      },
      {
        id: "PAT-002",
        name: "Sunita Devi Patel",
        abhaId: "14-5481-9023-1184",
        age: 38,
        gender: "Female",
        location: "West Delhi (Janakpuri)",
        totalVisits: 12,
        primaryDepartment: "General Medicine",
        assignedDoctor: "Dr. Sharma, MD",
        lastVisitDate: "08 Sep 2026",
        status: "Active",
        condition: "Type-2 Diabetes Management"
      },
      {
        id: "PAT-003",
        name: "Sanjay Balwantrao Shinde",
        abhaId: "14-9822-3344-5512",
        age: 51,
        gender: "Male",
        location: "Noida Sector 62",
        totalVisits: 11,
        primaryDepartment: "Orthopedics",
        assignedDoctor: "Dr. R. Kulkarni, MS",
        lastVisitDate: "07 Sep 2026",
        status: "Active",
        condition: "Post-op Knee Rehab"
      },
      {
        id: "PAT-004",
        name: "Meenakshi Sundaram",
        abhaId: "14-7721-6643-9821",
        age: 64,
        gender: "Female",
        location: "East Delhi (Mayur Vihar)",
        totalVisits: 10,
        primaryDepartment: "Ophthalmology",
        assignedDoctor: "Dr. N. Rao, MS",
        lastVisitDate: "04 Sep 2026",
        status: "Active",
        condition: "Glaucoma Care"
      },
      {
        id: "PAT-005",
        name: "Gurpreet Singh",
        abhaId: "14-3312-9901-4478",
        age: 47,
        gender: "Male",
        location: "North Delhi (Rohini)",
        totalVisits: 9,
        primaryDepartment: "Pulmonology",
        assignedDoctor: "Dr. P. Bansal, MD",
        lastVisitDate: "01 Sep 2026",
        status: "Active",
        condition: "Chronic Asthma Monitoring"
      },
      {
        id: "PAT-006",
        name: "Ananya Mukherjee",
        abhaId: "14-1189-5567-2234",
        age: 29,
        gender: "Female",
        location: "Gurugram Phase 3",
        totalVisits: 8,
        primaryDepartment: "Gynecology & Obstetrics",
        assignedDoctor: "Dr. K. Saxena, MS",
        lastVisitDate: "28 Aug 2026",
        status: "Active",
        condition: "Antenatal Trimester 2"
      },
      {
        id: "PAT-007",
        name: "Mohd. Tariq Ansari",
        abhaId: "14-6643-2211-8890",
        age: 58,
        gender: "Male",
        location: "Faridabad Sector 15",
        totalVisits: 8,
        primaryDepartment: "Nephrology",
        assignedDoctor: "Dr. S. Qureshi, DM",
        lastVisitDate: "26 Aug 2026",
        status: "Active",
        condition: "CKD Stage 3 Review"
      },
      {
        id: "PAT-008",
        name: "Pushpa Rani Joshi",
        abhaId: "14-9988-7711-2244",
        age: 72,
        gender: "Female",
        location: "Central Delhi (Karol Bagh)",
        totalVisits: 7,
        primaryDepartment: "Geriatric Care",
        assignedDoctor: "Dr. V. Joshi, MD",
        lastVisitDate: "22 Aug 2026",
        status: "Active",
        condition: "Senior Wellness & Arthritis"
      }
    ],

    // Geographic distribution of hospital patients across regional districts & cities
    customersByLocation: [
      { location: "South Delhi", patients: 4210, percentage: 22.8, color: "bg-blue-600", note: "Primary local zone (AIIMS catchment)" },
      { location: "West Delhi", patients: 3450, percentage: 18.7, color: "bg-indigo-600", note: "Metro corridor patient cluster" },
      { location: "East Delhi & Trans-Yamuna", patients: 2890, percentage: 15.7, color: "bg-cyan-600", note: "Civil hospital referral corridor" },
      { location: "North & Central Delhi", patients: 2420, percentage: 13.1, color: "bg-teal-600", note: "Old Delhi & Walled City hub" },
      { location: "Noida / Greater Noida", patients: 2180, percentage: 11.8, color: "bg-emerald-600", note: "Suburban Expressway catchment" },
      { location: "Gurugram (Haryana)", patients: 1740, percentage: 9.4, color: "bg-amber-500", note: "Corporate & worker commuter zone" },
      { location: "Faridabad & Outstation", patients: 1560, percentage: 8.5, color: "bg-slate-600", note: "Interstate train & bus terminal arrivals" }
    ]
  },

  // ==========================================
  // 3. KIOSK HARDWARE & TERMINAL FLEET STATUS
  // ==========================================
  kioskFleetStatus: [
    {
      kioskId: "OPD-GATE-01",
      location: "Main Entrance Atrium",
      ipAddress: "192.168.1.101",
      status: "Online",
      todayLogins: 94,
      paperRollPercentage: 88,
      biometricSensor: "Operational",
      uptime: "99.8%"
    },
    {
      kioskId: "OPD-GATE-02",
      location: "Casualty & Emergency Wing",
      ipAddress: "192.168.1.102",
      status: "Online",
      todayLogins: 86,
      paperRollPercentage: 42,
      biometricSensor: "Operational",
      uptime: "99.9%"
    },
    {
      kioskId: "OPD-GATE-03",
      location: "Pediatrics & MCH Block",
      ipAddress: "192.168.1.103",
      status: "Online",
      todayLogins: 58,
      paperRollPercentage: 75,
      biometricSensor: "Operational",
      uptime: "99.4%"
    },
    {
      kioskId: "CHC-AYUSH-01",
      location: "Ayushman Bharat Desk",
      ipAddress: "192.168.1.104",
      status: "Online",
      todayLogins: 48,
      paperRollPercentage: 91,
      biometricSensor: "Operational",
      uptime: "100.0%"
    }
  ],

  // ==========================================
  // 4. LIVE AUDIT LOG FEED (RECENT CHECK-INS)
  // ==========================================
  recentActivityFeed: [
    {
      timestamp: "11:24 AM",
      patientName: "Ramesh Kumar Sharma",
      identifier: "14-8892-4412-9031",
      method: "ABHA ID",
      token: "OPD-A-042",
      department: "Cardiology",
      kioskId: "OPD-GATE-02",
      status: "Verified"
    },
    {
      timestamp: "11:22 AM",
      patientName: "Sunita Devi Patel",
      identifier: "5481 •••• 1184",
      method: "Aadhaar OTP",
      token: "OPD-A-041",
      department: "General Medicine",
      kioskId: "OPD-GATE-01",
      status: "Verified"
    },
    {
      timestamp: "11:19 AM",
      patientName: "Sanjay Balwantrao Shinde",
      identifier: "9822 •••• 5512",
      method: "Biometric Thumb",
      token: "OPD-B-019",
      department: "Orthopedics",
      kioskId: "OPD-GATE-02",
      status: "Verified"
    },
    {
      timestamp: "11:15 AM",
      patientName: "Aarav Dev Sharma",
      identifier: "14-4190-2219-0943",
      method: "New Patient Reg",
      token: "OPD-N-012",
      department: "Pediatrics",
      kioskId: "OPD-GATE-03",
      status: "Created ABHA"
    },
    {
      timestamp: "11:11 AM",
      patientName: "Meenakshi Sundaram",
      identifier: "14-7721-6643-9821",
      method: "ABHA ID",
      token: "OPD-A-040",
      department: "Ophthalmology",
      kioskId: "OPD-GATE-01",
      status: "Verified"
    },
    {
      timestamp: "11:08 AM",
      patientName: "Kavita Rao",
      identifier: "3291 •••• 9912",
      method: "Aadhaar OTP",
      token: "OPD-A-039",
      department: "Gynecology",
      kioskId: "CHC-AYUSH-01",
      status: "Verified"
    }
  ]
};

