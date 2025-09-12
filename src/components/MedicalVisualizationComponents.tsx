"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Enhanced Medical Data Visualization Components

interface VitalSignsData {
  time: string;
  heartRate: number;
  bloodPressure: number;
  temperature: number;
  oxygenSat: number;
}

interface PatientMetrics {
  category: string;
  value: number;
  color: string;
}

interface MedicalChartProps {
  data: VitalSignsData[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
}

// Vital Signs Chart Component
export const VitalSignsChart: React.FC<MedicalChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  animated = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      variants={chartVariants}
      initial={shouldAnimate ? "hidden" : "visible"}
      animate={shouldAnimate ? "visible" : undefined}
      transition={{ duration: 0.6 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Real-time Vital Signs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Continuous patient monitoring with AI-powered anomaly detection
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          )}
          <XAxis
            dataKey="time"
            className="text-xs text-gray-500"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-xs text-gray-500" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          />
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
            name="Heart Rate (BPM)"
          />
          <Line
            type="monotone"
            dataKey="oxygenSat"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            name="Oxygen Saturation (%)"
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
            name="Temperature (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Patient Distribution Pie Chart
export const PatientDistributionChart: React.FC<{
  data: PatientMetrics[];
  title?: string;
  height?: number;
}> = ({ data, title = "Patient Distribution", height = 300 }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Current patient demographics and condition distribution
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.category}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {data.map((item) => (
          <div key={item.category} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2 color-indicator"
              data-color={item.color}
              style={{ '--indicator-color': item.color } as React.CSSProperties}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {item.category}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Revenue Analytics Area Chart
export const RevenueAnalyticsChart: React.FC<{
  data: any[];
  title?: string;
  height?: number;
}> = ({ data, title = "Revenue Analytics", height = 300 }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monthly revenue trends with predictive forecasting
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="month"
            className="text-xs text-gray-500"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-xs text-gray-500" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// AI Performance Metrics Bar Chart
export const AIPerformanceChart: React.FC<{
  data: any[];
  title?: string;
  height?: number;
}> = ({ data, title = "AI Performance Metrics", height = 300 }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time AI model performance and accuracy metrics
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="model"
            className="text-xs text-gray-500"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-xs text-gray-500" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          />
          <Bar
            dataKey="accuracy"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            name="Accuracy (%)"
          />
          <Bar
            dataKey="precision"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            name="Precision (%)"
          />
          <Bar
            dataKey="recall"
            fill="#f59e0b"
            radius={[8, 8, 0, 0]}
            name="Recall (%)"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Medical Alert Timeline Component
export const MedicalAlertTimeline: React.FC<{
  alerts: Array<{
    id: string;
    time: string;
    type: "critical" | "warning" | "info";
    message: string;
    patient: string;
  }>;
}> = ({ alerts }) => {
  const prefersReducedMotion = useReducedMotion();
  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const getAlertBadgeStyle = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Medical Alert Timeline
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time patient alerts and system notifications
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-xl border-l-4 ${getAlertColor(alert.type)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Patient: {alert.patient}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">{alert.time}</p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertBadgeStyle(
                  alert.type
                )}`}
              >
                {alert.type}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Default export
export default VitalSignsChart;
