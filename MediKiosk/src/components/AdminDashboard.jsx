import React, { useState, useMemo } from 'react';
import { 
  Users, 
  LogIn, 
  UserCheck, 
  UserPlus, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  Printer, 
  Search, 
  ShieldCheck, 
  BarChart3, 
  PieChart, 
  HardDrive, 
  Radio, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Fingerprint,
  CreditCard,
  Building2,
  PhoneCall
} from 'lucide-react';
import { analyticsData } from '../data/mockAnalyticsData';
import { sounds } from '../utils/audioTTS';

const AdminDashboard = ({ onBackToKiosk }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logins' | 'customers' | 'fleet'
  const [timeRange, setTimeRange] = useState('month'); // 'today' | 'week' | 'month' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  const { userLoginAnalytics, customerAnalytics, kioskFleetStatus, recentActivityFeed } = analyticsData;

  // Filtered Top Customers by search query and location
  const filteredCustomers = useMemo(() => {
    return customerAnalytics.topCustomers.filter((patient) => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.abhaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.primaryDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.assignedDoctor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = locationFilter === 'all' || patient.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [customerAnalytics.topCustomers, searchQuery, locationFilter]);

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  const handleTabChange = (tabId) => {
    sounds.playClick();
    setActiveTab(tabId);
  };

  const handleTimeRangeChange = (range) => {
    sounds.playClick();
    setTimeRange(range);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ================= TOP ADMIN NAVIGATION HEADER ================= */}
      <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Hospital Name & Title */}
        <div className="flex items-center space-x-3.5">
          <button
            type="button"
            onClick={onBackToKiosk}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition active:scale-95 shadow"
            title="Return to Patient Kiosk"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Kiosk</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <BarChart3 size={18} className="text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white font-display leading-tight">
                  Hospital Admin & Kiosk Analytics
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ABDM 2.0 HMIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {analyticsData.hospitalName} • Real-Time Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions, Live Status, Print */}
        <div className="flex items-center space-x-2.5">
          {/* Live System Heartbeat */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Sync Active</span>
          </div>

          {/* Time Range Filter Switcher */}
          <div className="flex bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs font-semibold">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'all', label: 'All Time' }
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleTimeRangeChange(btn.id)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeRange === btn.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Print / Export Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition shadow"
            title="Print Analytics Report"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Export / Print</span>
          </button>
        </div>

      </header>

      {/* ================= SECONDARY SUB-NAV TABS ================= */}
      <div className="w-full bg-slate-950/60 border-b border-slate-800/80 px-4 sm:px-8">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 text-xs sm:text-sm font-bold">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Activity },
            { id: 'logins', label: 'User & Login Analytics', icon: LogIn },
            { id: 'customers', label: 'Customer (Patient) Analytics', icon: Users },
            { id: 'fleet', label: 'Kiosk Terminal Network', icon: HardDrive }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* TOP LEVEL KPI CARDS (Always visible across all tabs)          */}
        {/* ------------------------------------------------------------- */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* Card 1: Total Logins */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Logins</span>
              <LogIn size={15} className="text-blue-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {userLoginAnalytics.totalLogins.toLocaleString()}
              </span>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <TrendingUp size={12} />
                <span>+18.4% all-time</span>
              </div>
            </div>
          </div>

          {/* Card 2: Logins This Month */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>This Month</span>
              <Calendar size={15} className="text-indigo-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {userLoginAnalytics.loginsThisMonth.toLocaleString()}
              </span>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <TrendingUp size={12} />
                <span>+12.6% MoM</span>
              </div>
            </div>
          </div>

          {/* Card 3: Logins This Week */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>This Week</span>
              <Activity size={15} className="text-cyan-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {userLoginAnalytics.loginsThisWeek.toLocaleString()}
              </span>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <TrendingUp size={12} />
                <span>+8.2% WoW</span>
              </div>
            </div>
          </div>

          {/* Card 4: Logins Today */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Today Logins</span>
              <Clock size={15} className="text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {userLoginAnalytics.loginsToday.toLocaleString()}
              </span>
              <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-semibold mt-1">
                <Sparkles size={12} />
                <span>Peak: 94 / hr</span>
              </div>
            </div>
          </div>

          {/* Card 5: Unique Users Logged In */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-500/50 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Unique Users</span>
              <UserCheck size={15} className="text-teal-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {userLoginAnalytics.uniqueUsersLoggedIn.toLocaleString()}
              </span>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">
                74.1% of all visits
              </div>
            </div>
          </div>

          {/* Card 6: New Users This Month */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>New Users (Mo)</span>
              <UserPlus size={15} className="text-amber-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {userLoginAnalytics.newUsersThisMonth.toLocaleString()}
              </span>
              <div className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold mt-1">
                <TrendingUp size={12} />
                <span>+14.65% vs prev</span>
              </div>
            </div>
          </div>

        </section>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Middle Grid: Authentication Method Distribution & Hourly OPD Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Login Method Distribution */}
              <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <PieChart size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">Check-In Method Split</h3>
                  </div>
                  <span className="text-xs text-slate-400">All Logins</span>
                </div>

                <div className="space-y-3.5">
                  {userLoginAnalytics.methodsDistribution.map((item) => (
                    <div key={item.method} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.method}</span>
                        <span className="text-slate-400">
                          <strong>{item.count.toLocaleString()}</strong> ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`${item.color} h-full rounded-full transition-all duration-500`} 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
                  <span>Fastest Check-In Method:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Fingerprint size={14} /> Biometric (~12 seconds)
                  </span>
                </div>
              </div>

              {/* Hourly OPD Traffic Distribution Chart */}
              <div className="lg:col-span-7 bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <BarChart3 size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">Today's Hourly OPD Intake Curve</h3>
                  </div>
                  <span className="text-xs text-slate-400">Check-ins per hour</span>
                </div>

                {/* Bar Chart Visualization */}
                <div className="flex items-end justify-between h-44 pt-4 px-2 border-b border-slate-700 gap-2">
                  {userLoginAnalytics.hourlyTraffic.map((hour) => {
                    const maxCount = 94;
                    const heightPercent = Math.round((hour.checkIns / maxCount) * 100);
                    const isPeak = hour.checkIns >= 90;
                    return (
                      <div key={hour.hour} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] text-slate-400 font-mono mb-1 opacity-0 group-hover:opacity-100 transition">
                          {hour.checkIns}
                        </div>
                        <div 
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            isPeak 
                              ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/30' 
                              : 'bg-slate-700 group-hover:bg-slate-600'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-mono text-slate-400 mt-2 block shrink-0">
                          {hour.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-400"></span>
                    <span>Peak Rush: <strong>09:00 AM – 11:00 AM</strong></span>
                  </div>
                  <span>Average Check-in Time: <strong>26s</strong></span>
                </div>
              </div>

            </div>

            {/* Bottom Row: Customer Analytics Summary & Recent Check-In Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Customer Retention & Acquisition Snapshot */}
              <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2.5 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Users size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">Customer (Patient) Health</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Retention Rate */}
                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/60">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>Patient Retention Rate</span>
                        <span className="text-emerald-400 font-bold">{customerAnalytics.customerRetentionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${customerAnalytics.customerRetentionRate}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">Returning chronic & routine OPD follow-up visitors</p>
                    </div>

                    {/* Acquisition Rate */}
                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/60">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>New Acquisition Rate</span>
                        <span className="text-blue-400 font-bold">{customerAnalytics.customerAcquisitionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${customerAnalytics.customerAcquisitionRate}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">First-time hospital registrations creating new ABHA ID</p>
                    </div>

                    {/* MoM Growth Pill */}
                    <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs">
                      <span className="text-indigo-200">New Patients vs Previous Month</span>
                      <strong className="text-indigo-400 font-bold">{customerAnalytics.newCustomersVsPreviousMonthPercentage}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange('customers')}
                  className="mt-5 w-full py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Explore Customer Analytics</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Live Activity Audit Feed */}
              <div className="lg:col-span-8 bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">Live Check-In Telemetry Stream</h3>
                  </div>
                  <span className="text-xs text-slate-400">Recent arrivals</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="pb-2.5">Time</th>
                        <th className="pb-2.5">Patient Name</th>
                        <th className="pb-2.5">Identifier</th>
                        <th className="pb-2.5">Method</th>
                        <th className="pb-2.5">Assigned Token</th>
                        <th className="pb-2.5">Department</th>
                        <th className="pb-2.5">Terminal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {recentActivityFeed.map((activity, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 font-mono text-slate-400">{activity.timestamp}</td>
                          <td className="py-2.5 font-bold text-white">{activity.patientName}</td>
                          <td className="py-2.5 font-mono text-slate-400">{activity.identifier}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">
                              {activity.method}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono font-bold text-cyan-400">{activity.token}</td>
                          <td className="py-2.5 text-slate-300">{activity.department}</td>
                          <td className="py-2.5 text-slate-400 font-mono text-[11px]">{activity.kioskId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: USER & LOGIN ANALYTICS                                 */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'logins' && (
          <div className="space-y-6">

            {/* User & Login Metrics Deep Breakdown Banner */}
            <div className="p-6 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-700/50 rounded-3xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                    User & Login Analytics Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200 mt-1">
                    Telemetry analysis of patient arrivals, session durations, authentication routes, and peak check-in surges.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-blue-950/80 border border-blue-500/30 rounded-2xl text-center">
                    <span className="text-[10px] text-blue-300 uppercase font-semibold block">Unique Users Ratio</span>
                    <span className="text-xl font-bold text-white font-mono">
                      {Math.round((userLoginAnalytics.uniqueUsersLoggedIn / userLoginAnalytics.totalLogins) * 100)}%
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl text-center">
                    <span className="text-[10px] text-indigo-300 uppercase font-semibold block">Monthly Growth</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      +12.6%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Metric 1 & 2: Total Logins & Logins This Month */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All-Time & Month</span>
                  <LogIn size={18} className="text-blue-400" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-300">Total Logins:</span>
                    <span className="text-2xl font-bold text-white font-mono">{userLoginAnalytics.totalLogins.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-300">Logins This Month:</span>
                    <span className="text-xl font-bold text-blue-400 font-mono">{userLoginAnalytics.loginsThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
                    <span>Monthly Check-in Share:</span>
                    <strong className="text-white font-mono">17.3% of total</strong>
                  </div>
                </div>
              </div>

              {/* Metric 3 & 4: Logins This Week & Logins Today */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly & Daily Flow</span>
                  <Clock size={18} className="text-cyan-400" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-300">Logins This Week:</span>
                    <span className="text-2xl font-bold text-white font-mono">{userLoginAnalytics.loginsThisWeek.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-300">Logins Today:</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">{userLoginAnalytics.loginsToday.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
                    <span>Today vs Daily Average:</span>
                    <strong className="text-emerald-400 font-mono">+6.4% above avg</strong>
                  </div>
                </div>
              </div>

              {/* Metric 5 & 6: Unique Users & New Users This Month */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique & New Users</span>
                  <UserPlus size={18} className="text-amber-400" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-300">Unique Users Logged In:</span>
                    <span className="text-2xl font-bold text-white font-mono">{userLoginAnalytics.uniqueUsersLoggedIn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-300">New Users This Month:</span>
                    <span className="text-xl font-bold text-amber-400 font-mono">{userLoginAnalytics.newUsersThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
                    <span>New User Inflow Rate:</span>
                    <strong className="text-amber-400 font-mono">20.6% of this month</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Login Methods Channel Analysis */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white font-display mb-4">
                Authentication Channels Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {userLoginAnalytics.methodsDistribution.map((method) => (
                  <div key={method.method} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/60">
                    <div className="text-xs text-slate-400 font-semibold mb-1">{method.method}</div>
                    <div className="text-2xl font-extrabold text-white font-mono">{method.count.toLocaleString()}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-500">Channel Share</span>
                      <span className={`font-bold ${method.textColor}`}>{method.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Terminal Telemetry Full Audit Table */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display">Live User Check-In Audit Logs</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time terminal event log verified via ABDM Gateway</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono">
                    ● Streaming
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Identification Value</th>
                      <th className="pb-3">Auth Method</th>
                      <th className="pb-3">Assigned Token</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Kiosk Gateway</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {recentActivityFeed.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 font-mono text-slate-400">{log.timestamp}</td>
                        <td className="py-3 font-bold text-white">{log.patientName}</td>
                        <td className="py-3 font-mono text-slate-400">{log.identifier}</td>
                        <td className="py-3 font-semibold text-blue-300">{log.method}</td>
                        <td className="py-3 font-mono font-bold text-cyan-400">{log.token}</td>
                        <td className="py-3 text-slate-300">{log.department}</td>
                        <td className="py-3 font-mono text-slate-400">{log.kioskId}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CUSTOMER (PATIENT) ANALYTICS                           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'customers' && (
          <div className="space-y-6">

            {/* Customer Analytics Header Card */}
            <div className="p-6 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-700/50 rounded-3xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                    Customer (Patient) Lifecycle & Demographics
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                    Longitudinal cohort analytics: retention, acquisition rates, chronic visit frequencies, and regional geographic distribution.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-center">
                    <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Retention Rate</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      {customerAnalytics.customerRetentionRate}%
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-teal-950/80 border border-teal-500/30 rounded-2xl text-center">
                    <span className="text-[10px] text-teal-300 uppercase font-semibold block">MoM New Growth</span>
                    <span className="text-xl font-bold text-white font-mono">
                      {customerAnalytics.newCustomersVsPreviousMonthPercentage}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Metric Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              
              {/* Total Customers */}
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 block">Total Customers</span>
                <span className="text-2xl font-extrabold text-white font-display mt-1 block">
                  {customerAnalytics.totalCustomers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">All registered records</span>
              </div>

              {/* New Customers This Month */}
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 block">New This Month</span>
                <span className="text-2xl font-extrabold text-blue-400 font-display mt-1 block">
                  {customerAnalytics.newCustomersThisMonth.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">{customerAnalytics.newCustomersVsPreviousMonthPercentage} vs prev</span>
              </div>

              {/* Active Customers */}
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 block">Active Customers</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-display mt-1 block">
                  {customerAnalytics.activeCustomers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Visited in &lt;90 days</span>
              </div>

              {/* Inactive Customers */}
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 block">Inactive Customers</span>
                <span className="text-2xl font-extrabold text-amber-400 font-display mt-1 block">
                  {customerAnalytics.inactiveCustomers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">No visits &gt;90 days</span>
              </div>

              {/* Returning Customers */}
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 block">Returning Customers</span>
                <span className="text-2xl font-extrabold text-cyan-400 font-display mt-1 block">
                  {customerAnalytics.returningCustomers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Visited ≥ 2 times</span>
              </div>

              {/* Retention Ratio */}
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 block">Acquisition Rate</span>
                <span className="text-2xl font-extrabold text-indigo-400 font-display mt-1 block">
                  {customerAnalytics.customerAcquisitionRate}%
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">New patient share</span>
              </div>

            </div>

            {/* Customers by Location & Regional Spread */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Customers by Location (Geographic Catchment)</h3>
                    <p className="text-xs text-slate-400">Patient residency distribution across Delhi NCR & referral districts</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                  7 Regional Clusters
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerAnalytics.customersByLocation.map((loc) => (
                  <div key={loc.location} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-white text-sm block">{loc.location}</span>
                        <span className="text-[11px] text-slate-400">{loc.note}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono block">
                          {loc.patients.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-blue-400">{loc.percentage}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`${loc.color} h-full rounded-full`} style={{ width: `${loc.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Customers (Patients) Directory Table */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Top Customers (Frequent OPD Care Beneficiaries)</h3>
                    <p className="text-xs text-slate-400">Patients with active chronic care management, rehabilitation, or recurring follow-ups</p>
                  </div>
                </div>

                {/* Search & Location Filter */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search patient, ABHA, doctor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 w-52 sm:w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">ABHA ID</th>
                      <th className="pb-3">Age / Gender</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Visits</th>
                      <th className="pb-3">Department & Care Plan</th>
                      <th className="pb-3">Assigned Doctor</th>
                      <th className="pb-3">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3">
                            <span className="font-bold text-white block">{patient.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{patient.id}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-400 font-medium">{patient.abhaId}</td>
                          <td className="py-3 text-slate-400">{patient.age}y, {patient.gender}</td>
                          <td className="py-3 text-slate-300">{patient.location}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-400 font-bold font-mono text-xs">
                              {patient.totalVisits} visits
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-white block">{patient.primaryDepartment}</span>
                            <span className="text-[10px] text-slate-400">{patient.condition}</span>
                          </td>
                          <td className="py-3 text-slate-300">{patient.assignedDoctor}</td>
                          <td className="py-3 font-mono text-slate-400">{patient.lastVisitDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No patients found matching your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: KIOSK FLEET & TERMINAL NETWORK                         */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">

            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Kiosk Terminal Fleet Health
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Active monitoring of physical touchscreen kiosks, receipt paper levels, and STQC biometric sensors.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  All 4 Kiosks Operational
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {kioskFleetStatus.map((kiosk) => (
                <div key={kiosk.kioskId} className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <HardDrive size={22} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-mono">{kiosk.kioskId}</h4>
                        <p className="text-xs text-slate-400">{kiosk.location}</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{kiosk.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Today's Check-ins</span>
                      <span className="text-lg font-bold text-white font-mono">{kiosk.todayLogins} tokens</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">System Uptime</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">{kiosk.uptime}</span>
                    </div>
                  </div>

                  {/* Paper roll level */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Thermal Slip Paper Roll:</span>
                      <span className={kiosk.paperRollPercentage < 50 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {kiosk.paperRollPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          kiosk.paperRollPercentage < 50 ? 'bg-amber-500' : 'bg-blue-500'
                        }`} 
                        style={{ width: `${kiosk.paperRollPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>IP: {kiosk.ipAddress}</span>
                    <span className="text-emerald-400">Biometric: {kiosk.biometricSensor}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full bg-slate-950 border-t border-slate-800 px-6 py-4 mt-auto text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Hospital Administration Portal • DPDP Act 2023 & ABDM Compliant</span>
        </div>
        <div>
          <span>Ayushman Bharat National Health Authority Telemetry API v2.0</span>
        </div>
      </footer>

    </div>
  );
};

export default AdminDashboard;

