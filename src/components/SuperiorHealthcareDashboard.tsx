"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Globe,
  Heart,
  Home,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  TrendingUp,
  Network,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { apiClient, type DashboardMetrics, type PatientRecord as ApiPatientRecord } from "@/lib/api-client";
import {
  AIPerformanceChart,
  MedicalAlertTimeline,
  PatientDistributionChart,
  RevenueAnalyticsChart,
  VitalSignsChart,
} from "./MedicalVisualizationComponents";
import OidTree from "./OidTree";

// Enhanced TypeScript Interfaces
interface DashboardState {
  sidebarOpen: boolean;
  darkMode: boolean;
  activeView: string;
  language: "en" | "ar";
  notifications: NotificationItem[];
  loading: boolean;
  searchQuery: string;
  selectedPatient: string | null;
  dateRange: string;
  refreshInterval: number;
}

interface NotificationItem {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  patient?: string;
  action?: string;
}

interface PatientRecord {
  id: string;
  name: string;
  nameAr?: string;
  age: number;
  gender: "M" | "F" | "male" | "female";
  condition: string;
  severity: "low" | "medium" | "high" | "critical";
  lastVisit?: string;
  nextAppointment?: string;
  assignedDoctor: string;
  roomNumber?: string;
  vitalSigns: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSat: number;
    respiratoryRate: number;
  };
  medications: string[];
  allergies: string[];
  status: "active" | "discharged" | "transferred" | "critical" | "admitted" | "stable";
}

interface SystemMetrics {
  patients: {
    total: number;
    active: number;
    critical: number;
    newToday: number;
    trend: number;
  };
  appointments: {
    total: number;
    today: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    trend: number;
  };
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    claims: number;
    trend: number;
  };
  aiPerformance: {
    accuracy: number;
    predictions: number;
    automated: number;
    efficiency: number;
  };
  compliance: {
    hipaa: number;
    nphies: number;
    security: number;
    audit: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    apiLatency: number;
    errorRate: number;
  };
}

// Main Enhanced Healthcare Dashboard
const SuperiorHealthcareDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    sidebarOpen: true,
    darkMode: false,
    activeView: "overview",
    language: "en",
    notifications: [],
    loading: true,
    searchQuery: "",
    selectedPatient: null,
    dateRange: "7d",
    refreshInterval: 30000,
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    patients: { total: 0, active: 0, critical: 0, newToday: 0, trend: 0 },
    appointments: {
      total: 0,
      today: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      trend: 0,
    },
    revenue: { total: 0, monthly: 0, weekly: 0, daily: 0, claims: 0, trend: 0 },
    aiPerformance: { accuracy: 0, predictions: 0, automated: 0, efficiency: 0 },
    compliance: { hipaa: 0, nphies: 0, security: 0, audit: 0 },
    systemHealth: { cpuUsage: 0, memoryUsage: 0, apiLatency: 0, errorRate: 0 },
  });

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("24h");
  const unreadCount = state.notifications.filter((n) => !n.acknowledged).length;
  const { addToast } = useToast();

  // Sample data for charts
  const vitalSignsData = [
    {
      time: "00:00",
      heartRate: 72,
      bloodPressure: 120,
      temperature: 36.5,
      oxygenSat: 98,
    },
    {
      time: "04:00",
      heartRate: 68,
      bloodPressure: 118,
      temperature: 36.3,
      oxygenSat: 99,
    },
    {
      time: "08:00",
      heartRate: 75,
      bloodPressure: 125,
      temperature: 36.7,
      oxygenSat: 97,
    },
    {
      time: "12:00",
      heartRate: 82,
      bloodPressure: 130,
      temperature: 36.8,
      oxygenSat: 98,
    },
    {
      time: "16:00",
      heartRate: 79,
      bloodPressure: 128,
      temperature: 36.6,
      oxygenSat: 98,
    },
    {
      time: "20:00",
      heartRate: 74,
      bloodPressure: 122,
      temperature: 36.4,
      oxygenSat: 99,
    },
  ];

  const patientDistributionData = [
    { category: "Cardiac", value: 45, color: "#ef4444" },
    { category: "Respiratory", value: 32, color: "#3b82f6" },
    { category: "Neurological", value: 28, color: "#10b981" },
    { category: "Orthopedic", value: 23, color: "#f59e0b" },
    { category: "Other", value: 18, color: "#8b5cf6" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 450000 },
    { month: "Feb", revenue: 520000 },
    { month: "Mar", revenue: 480000 },
    { month: "Apr", revenue: 610000 },
    { month: "May", revenue: 580000 },
    { month: "Jun", revenue: 680000 },
  ];

  const aiPerformanceData = [
    { model: "Transcription", accuracy: 97.2, precision: 96.8, recall: 95.4 },
    { model: "Imaging", accuracy: 94.5, precision: 93.2, recall: 94.8 },
    { model: "Diagnosis", accuracy: 91.8, precision: 90.5, recall: 92.1 },
    { model: "Prediction", accuracy: 89.3, precision: 88.7, recall: 90.2 },
  ];

  // Enhanced data loading with real-time updates
  const loadDashboardData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Load dashboard metrics from API
      const metricsResponse = await apiClient.getDashboardMetrics();
      if (metricsResponse.success && metricsResponse.data) {
        // Convert API data to match existing interface
        const apiData = metricsResponse.data;
        setMetrics({
          patients: {
            total: apiData.patients.total,
            active: apiData.patients.admitted,
            critical: apiData.patients.critical,
            newToday: apiData.patients.discharged,
            trend: apiData.patients.trend,
          },
          appointments: {
            total: apiData.appointments.total,
            today: apiData.appointments.today,
            upcoming: apiData.appointments.upcoming,
            completed: apiData.appointments.completed,
            cancelled: apiData.appointments.cancelled,
            trend: apiData.appointments.trend,
          },
          revenue: {
            total: apiData.revenue.total,
            monthly: apiData.revenue.monthly,
            weekly: apiData.revenue.weekly,
            daily: apiData.revenue.daily,
            claims: apiData.revenue.claims,
            trend: apiData.revenue.trend,
          },
          aiPerformance: apiData.aiPerformance,
          compliance: apiData.compliance,
          systemHealth: apiData.systemHealth,
        });
      }

      // Load patient records
      const patientsResponse = await apiClient.getPatientRecords();
      if (patientsResponse.success && patientsResponse.data) {
        setPatients(patientsResponse.data);
      } else {
        // Fallback data if API fails
        setPatients([
        {
          id: "P001",
          name: "Ahmed Mohammed Al-Rashid",
          nameAr: "أحمد محمد الراشد",
          age: 52,
          gender: "M",
          condition: "Acute Myocardial Infarction",
          severity: "critical",
          lastVisit: "2025-09-11T08:30:00Z",
          nextAppointment: "2025-09-12T10:00:00Z",
          assignedDoctor: "Dr. Sarah Johnson",
          roomNumber: "ICU-204",
          vitalSigns: {
            heartRate: 95,
            bloodPressure: "150/95",
            temperature: 37.2,
            oxygenSat: 94,
            respiratoryRate: 22,
          },
          medications: ["Aspirin 81mg", "Metoprolol 25mg", "Atorvastatin 40mg"],
          allergies: ["Penicillin"],
          status: "active",
        },
        {
          id: "P002",
          name: "Fatima Abdullah Al-Zahra",
          nameAr: "فاطمة عبدالله الزهراء",
          age: 34,
          gender: "F",
          condition: "Gestational Diabetes",
          severity: "medium",
          lastVisit: "2025-09-10T14:15:00Z",
          nextAppointment: "2025-09-17T09:30:00Z",
          assignedDoctor: "Dr. Ahmed Al-Mahmoud",
          roomNumber: "OB-108",
          vitalSigns: {
            heartRate: 88,
            bloodPressure: "135/85",
            temperature: 36.8,
            oxygenSat: 98,
            respiratoryRate: 18,
          },
          medications: ["Insulin Glargine", "Folic Acid", "Iron Supplement"],
          allergies: ["Latex"],
          status: "active",
        },
        {
          id: "P003",
          name: "Mohammed Hassan Al-Otaibi",
          nameAr: "محمد حسن العتيبي",
          age: 67,
          gender: "M",
          condition: "COPD Exacerbation",
          severity: "high",
          lastVisit: "2025-09-11T11:45:00Z",
          assignedDoctor: "Dr. Lisa Chen",
          roomNumber: "PULM-301",
          vitalSigns: {
            heartRate: 102,
            bloodPressure: "140/88",
            temperature: 37.5,
            oxygenSat: 89,
            respiratoryRate: 28,
          },
          medications: ["Albuterol", "Prednisone", "Azithromycin"],
          allergies: ["Shellfish", "Sulfa"],
          status: "active",
        },
        ]);
      }

      // Mock notifications - could be replaced with API call
      setState((prev) => ({
        ...prev,
        notifications: [
          {
            id: "1",
            type: "critical",
            title: "Critical Patient Alert",
            message:
              "Ahmed Al-Rashid shows deteriorating vital signs - oxygen saturation dropping",
            timestamp: "3 minutes ago",
            acknowledged: false,
            patient: "Ahmed Al-Rashid",
            action: "review",
          },
          {
            id: "2",
            type: "warning",
            title: "Medication Due",
            message:
              "Fatima Al-Zahra - Insulin administration due in 15 minutes",
            timestamp: "12 minutes ago",
            acknowledged: false,
            patient: "Fatima Al-Zahra",
            action: "administer",
          },
          {
            id: "3",
            type: "info",
            title: "AI Analysis Complete",
            message:
              "Chest X-ray analysis completed for Mohammed Al-Otaibi - results available",
            timestamp: "25 minutes ago",
            acknowledged: true,
            patient: "Mohammed Al-Otaibi",
          },
          {
            id: "4",
            type: "success",
            title: "Surgery Completed",
            message:
              "Laparoscopic procedure completed successfully for Patient ID: P087",
            timestamp: "1 hour ago",
            acknowledged: true,
          },
        ],
      }));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, state.refreshInterval);
    return () => clearInterval(interval);
  }, [loadDashboardData, state.refreshInterval]);

  // Navigation configuration
  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      labelAr: "نظرة عامة",
      icon: Home,
      badge: null,
    },
    {
      id: "patients",
      label: "Patients",
      labelAr: "المرضى",
      icon: Users,
      badge: metrics.patients.critical,
    },
    {
      id: "appointments",
      label: "Appointments",
      labelAr: "المواعيد",
      icon: Calendar,
      badge: metrics.appointments.today,
    },
    {
      id: "analytics",
      label: "Analytics",
      labelAr: "التحليلات",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "ai-insights",
      label: "AI Insights",
      labelAr: "رؤى الذكاء الاصطناعي",
      icon: Brain,
      badge: "NEW",
    },
    {
      id: "compliance",
      label: "Compliance",
      labelAr: "الامتثال",
      icon: Shield,
      badge: null,
    },
    {
      id: "fintech",
      label: "FinTech",
      labelAr: "التكنولوجيا المالية",
      icon: CreditCard,
      badge: null,
    },
    {
      id: "oid-management",
      label: "OID Management",
      labelAr: "إدارة المعرفات",
      icon: Network,
      badge: "NEW",
    },
    {
      id: "reports",
      label: "Reports",
      labelAr: "التقارير",
      icon: FileText,
      badge: null,
    },
    {
      id: "settings",
      label: "Settings",
      labelAr: "الإعدادات",
      icon: Settings,
      badge: null,
    },
  ];

  // Enhanced metric card component
  const EnhancedMetricCard: React.FC<{
    title: string;
    titleAr: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    icon: React.ElementType;
    color?: string;
    clickable?: boolean;
    loading?: boolean;
  }> = ({
    title,
    titleAr,
    value,
    subtitle,
    trend,
    icon: Icon,
    color = "blue",
    clickable = false,
    loading = false,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={clickable ? { scale: 1.02, y: -2 } : {}}
      className={`
        bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
        rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700
        hover:shadow-xl transition-all duration-300 relative overflow-hidden
        ${clickable ? "cursor-pointer" : ""}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {(() => {
                const colorGradients: Record<string, string> = {
                  blue: "from-blue-500 to-blue-600",
                  green: "from-green-500 to-green-600",
                  purple: "from-purple-500 to-purple-600",
                  red: "from-red-500 to-red-600",
                  orange: "from-orange-500 to-orange-600",
                };
                const gradient = colorGradients[color] || colorGradients.blue;
                return (
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                );
              })()}
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {state.language === "ar" ? titleAr : title}
              </p>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2"></div>
                {subtitle && (
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                )}
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          {trend !== undefined && (
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend >= 0
                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
              }`}
            >
              <TrendingUp
                className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`}
              />
              <span>
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Enhanced patient card
  const EnhancedPatientCard: React.FC<{ patient: PatientRecord }> = ({
    patient,
  }) => {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "critical":
          return "border-red-500 bg-red-50 dark:bg-red-900/20";
        case "high":
          return "border-orange-500 bg-orange-50 dark:bg-orange-900/20";
        case "medium":
          return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
        default:
          return "border-green-500 bg-green-50 dark:bg-green-900/20";
      }
    };

    const getSeverityBadgeColor = (severity: string) => {
      switch (severity) {
        case "critical":
          return "bg-red-100 text-red-800";
        case "high":
          return "bg-orange-100 text-orange-800";
        case "medium":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-green-100 text-green-800";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.01 }}
        className={`
          bg-white dark:bg-gray-800 rounded-2xl p-5 border-l-4 ${getSeverityColor(
            patient.severity
          )}
          shadow-lg hover:shadow-xl transition-all duration-300
        `}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
              {state.language === "ar" ? patient.nameAr : patient.name}
            </h4>
            <p className="text-sm text-gray-500">
              Age: {patient.age} • {patient.gender} • Room:{" "}
              {patient.roomNumber || "N/A"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {patient.condition}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadgeColor(
                patient.severity
              )}`}
            >
              {patient.severity.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">HR</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {patient.vitalSigns.heartRate}
            </p>
            <p className="text-xs text-gray-400">bpm</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">BP</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {patient.vitalSigns.bloodPressure}
            </p>
            <p className="text-xs text-gray-400">mmHg</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            View Details
          </button>
          <button
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="More patient options"
            aria-label="More patient options"
            type="button"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading BrainSAIT Healthcare Platform...
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Initializing AI systems and medical data
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${state.darkMode ? "dark" : ""}`}>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {state.sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        BrainSAIT
                      </h2>
                      <p className="text-sm text-gray-500">
                        Healthcare Platform v2.0
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setState((prev) => ({ ...prev, sidebarOpen: false }))
                    }
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <nav className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto" aria-label="Primary">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setState((prev) => ({ ...prev, activeView: item.id }))
                    }
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all duration-200
                      ${
                        state.activeView === item.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">
                        {state.language === "ar" ? item.labelAr : item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          state.activeView === item.id
                            ? "bg-white/20 text-white"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Enhanced Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4 space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        language: prev.language === "en" ? "ar" : "en",
                      }))
                    }
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                  >
                    <Globe className="w-4 h-4 inline mr-2" />
                    {state.language === "en" ? "العربية" : "English"}
                  </button>
                  <button
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        darkMode: !prev.darkMode,
                      }))
                    }
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {state.darkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      System Status
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    All systems operational •{" "}
                    {metrics.patients.active.toLocaleString()} active patients
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div
          className={`transition-all duration-300 ${
            state.sidebarOpen ? "ml-80" : "ml-0"
          }`}
        >
          {/* Enhanced Header */}
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40" role="banner">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!state.sidebarOpen && (
                  <button
                    onClick={() =>
                      setState((prev) => ({ ...prev, sidebarOpen: true }))
                    }
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Open sidebar"
                  >
                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                )}

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {state.language === "ar"
                      ? "لوحة التحكم الطبية المتقدمة"
                      : "Advanced Medical Dashboard"}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">
                      {state.language === "ar"
                        ? "مرحباً بك في منصة BrainSAIT"
                        : "Welcome to BrainSAIT Platform"}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Last updated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Enhanced Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      state.language === "ar"
                        ? "البحث عن المرضى أو الوثائق..."
                        : "Search patients, records..."
                    }
                    value={state.searchQuery}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        searchQuery: e.target.value,
                      }))
                    }
                    className="pl-10 pr-4 py-3 w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {state.searchQuery && (
                    <button
                      onClick={() =>
                        setState((prev) => ({ ...prev, searchQuery: "" }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Clear search"
                      aria-label="Clear search query"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Time Range Selector */}
                <div className="relative">
                  <select
                    value={selectedTimeFrame}
                    onChange={(e) => setSelectedTimeFrame(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select time range"
                    aria-label="Select time range for data display"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>

                {/* Enhanced Notifications */}
                <div className="relative" aria-live="polite" aria-atomic="true">
                  <button
                    className="relative p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    title="View notifications"
                    aria-label={`View notifications (${unreadCount} unread)`}
                  >
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Quick Actions */}
                <button
                  onClick={() => addToast(state.language === "ar" ? "تم إضافة المريض (تجريبي)" : "Patient added (demo)", "success")}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {state.language === "ar" ? "إضافة مريض" : "Add Patient"}
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="p-6 space-y-8">
            {state.activeView === "overview" && (
              <div className="space-y-8">
                {/* Enhanced Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <EnhancedMetricCard
                    title="Total Patients"
                    titleAr="إجمالي المرضى"
                    value={metrics.patients.total}
                    subtitle={`${metrics.patients.active} active`}
                    trend={metrics.patients.trend}
                    icon={Users}
                    color="blue"
                    clickable
                  />
                  <EnhancedMetricCard
                    title="Today's Appointments"
                    titleAr="مواعيد اليوم"
                    value={metrics.appointments.today}
                    subtitle={`${metrics.appointments.upcoming} upcoming`}
                    trend={metrics.appointments.trend}
                    icon={Calendar}
                    color="green"
                    clickable
                  />
                  <EnhancedMetricCard
                    title="Monthly Revenue"
                    titleAr="الإيرادات الشهرية"
                    value={`$${(metrics.revenue.monthly / 1000).toFixed(0)}K`}
                    subtitle={`${metrics.revenue.claims} claims processed`}
                    trend={metrics.revenue.trend}
                    icon={DollarSign}
                    color="purple"
                    clickable
                  />
                  <EnhancedMetricCard
                    title="AI Performance"
                    titleAr="أداء الذكاء الاصطناعي"
                    value={`${metrics.aiPerformance.accuracy}%`}
                    subtitle={`${metrics.aiPerformance.predictions} predictions`}
                    icon={Brain}
                    color="orange"
                    clickable
                  />
                </div>

                {/* Charts and Analytics Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Vital Signs Chart - Takes 2 columns */}
                  <div className="xl:col-span-2">
                    <VitalSignsChart
                      data={vitalSignsData}
                      height={400}
                      animated={true}
                    />
                  </div>

                  {/* Patient Distribution - Takes 1 column */}
                  <div>
                    <PatientDistributionChart
                      data={patientDistributionData}
                      title={
                        state.language === "ar"
                          ? "توزيع المرضى"
                          : "Patient Distribution"
                      }
                      height={400}
                    />
                  </div>
                </div>

                {/* Second Row of Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <RevenueAnalyticsChart
                    data={revenueData}
                    title={
                      state.language === "ar"
                        ? "تحليلات الإيرادات"
                        : "Revenue Analytics"
                    }
                    height={350}
                  />
                  <AIPerformanceChart
                    data={aiPerformanceData}
                    title={
                      state.language === "ar"
                        ? "أداء نماذج الذكاء الاصطناعي"
                        : "AI Model Performance"
                    }
                    height={350}
                  />
                </div>

                {/* Patients and Alerts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Recent Patients - Takes 2 columns */}
                  <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {state.language === "ar"
                            ? "المرضى الحاليون"
                            : "Current Patients"}
                        </h3>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                            <Filter className="w-4 h-4 inline mr-2" />
                            Filter
                          </button>
                          <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-xl transition-colors">
                            View All
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {patients.map((patient) => (
                          <EnhancedPatientCard
                            key={patient.id}
                            patient={patient}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Medical Alerts Timeline - Takes 1 column */}
                  <div>
                    <MedicalAlertTimeline
                      alerts={state.notifications
                        .filter((notification) =>
                          ["critical", "warning", "info"].includes(
                            notification.type
                          )
                        )
                        .map((notification) => ({
                          id: notification.id,
                          time: notification.timestamp,
                          type: notification.type as
                            | "critical"
                            | "warning"
                            | "info",
                          message: notification.message,
                          patient: notification.patient || "System",
                        }))}
                    />
                  </div>
                </div>

                {/* System Health Status */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {state.language === "ar" ? "حالة النظام" : "System Health"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {metrics.systemHealth.cpuUsage.toFixed(1)}%
                      </h4>
                      <p className="text-sm text-gray-500">CPU Usage</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {metrics.systemHealth.memoryUsage.toFixed(1)}%
                      </h4>
                      <p className="text-sm text-gray-500">Memory Usage</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {metrics.systemHealth.apiLatency.toFixed(0)}ms
                      </h4>
                      <p className="text-sm text-gray-500">API Latency</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {metrics.systemHealth.errorRate.toFixed(2)}%
                      </h4>
                      <p className="text-sm text-gray-500">Error Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OID Management View */}
            {state.activeView === "oid-management" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      OID Management
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Healthcare System Identity Registry & Management
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add OID</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl transition-colors"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-[600px]">
                    <OidTree
                      onNodeSelect={(node) => {
                        console.log('Selected OID node:', node);
                      }}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other Views Placeholder */}
            {state.activeView !== "overview" && state.activeView !== "oid-management" && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  {(() => {
                    const item = navigationItems.find(
                      (i) => i.id === state.activeView
                    );
                    return item ? (
                      <item.icon className="w-12 h-12 text-gray-400" />
                    ) : (
                      <Settings className="w-12 h-12 text-gray-400" />
                    );
                  })()}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {
                    navigationItems.find((item) => item.id === state.activeView)
                      ?.label
                  }{" "}
                  Interface
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Advanced{" "}
                  {navigationItems
                    .find((item) => item.id === state.activeView)
                    ?.label.toLowerCase()}{" "}
                  management system with AI-powered insights and real-time
                  analytics. This comprehensive interface is currently under
                  development with cutting-edge features.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-colors">
                    Coming Soon
                  </button>
                  <button
                    onClick={() =>
                      setState((prev) => ({ ...prev, activeView: "overview" }))
                    }
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-medium transition-colors"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperiorHealthcareDashboard;
