/**
 * Client-side API utilities for BrainSAIT Healthcare Platform
 * Works with static deployment by calling external API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface DashboardMetrics {
  patients: {
    total: number;
    admitted: number;
    discharged: number;
    critical: number;
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

export interface PatientRecord {
  id: string;
  name: string;
  nameAr?: string;
  age: number;
  gender: 'male' | 'female' | 'M' | 'F';
  admissionDate?: string;
  department?: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  doctor?: string;
  room?: string;
  status: 'admitted' | 'discharged' | 'critical' | 'stable' | 'active';
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
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vmzuql0azj.execute-api.us-east-1.amazonaws.com/prod';
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Healthcare-Platform': 'BrainSAIT-v2.0',
      'X-User-Agent': 'BrainSAIT-Web-Client/2.0.0',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const requestHeaders = {
        ...this.headers,
        ...additionalHeaders,
      };

      // Add request ID for tracking
      requestHeaders['X-Request-Id'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          details: errorData.details,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Dashboard API methods
  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    // Mock data for static deployment - replace with real API call
    const mockData: DashboardMetrics = {
      patients: {
        total: 1247,
        admitted: 89,
        discharged: 156,
        critical: 12,
        trend: 8.2,
      },
      appointments: {
        total: 2891,
        today: 47,
        upcoming: 234,
        completed: 189,
        cancelled: 8,
        trend: 12.5,
      },
      revenue: {
        total: 2847392,
        monthly: 847392,
        weekly: 234567,
        daily: 47392,
        claims: 1923847,
        trend: 15.3,
      },
      aiPerformance: {
        accuracy: 94.7,
        predictions: 15847,
        automated: 89.3,
        efficiency: 92.1,
      },
      compliance: {
        hipaa: 98.9,
        nphies: 96.7,
        security: 99.2,
        audit: 94.5,
      },
      systemHealth: {
        cpuUsage: 67.8,
        memoryUsage: 73.2,
        apiLatency: 89.3,
        errorRate: 0.23,
      },
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: mockData,
    };
  }

  async getPatientRecords(): Promise<ApiResponse<PatientRecord[]>> {
    // Mock data for static deployment
    const mockData: PatientRecord[] = [
      {
        id: 'P001',
        name: 'Ahmed Al-Rashid',
        nameAr: 'أحمد الراشد',
        age: 45,
        gender: 'male',
        admissionDate: '2024-01-15',
        department: 'Cardiology',
        condition: 'Acute Myocardial Infarction',
        severity: 'critical',
        doctor: 'Dr. Sarah Hassan',
        room: 'ICU-204',
        status: 'critical',
        lastVisit: '2025-09-11T08:30:00Z',
        nextAppointment: '2024-01-20T10:00:00Z',
        assignedDoctor: 'Dr. Sarah Hassan',
        roomNumber: 'ICU-204',
        vitalSigns: {
          heartRate: 89,
          bloodPressure: '130/85',
          temperature: 37.2,
          oxygenSat: 94,
          respiratoryRate: 18,
        },
        medications: ['Aspirin', 'Metoprolol', 'Atorvastatin'],
        allergies: ['Penicillin'],
      },
      {
        id: 'P002',
        name: 'Fatima Al-Zahra',
        nameAr: 'فاطمة الزهراء',
        age: 32,
        gender: 'female',
        admissionDate: '2024-01-16',
        department: 'Respiratory',
        condition: 'Severe Asthma Exacerbation',
        severity: 'high',
        doctor: 'Dr. Mohammed Alim',
        room: 'R-312',
        status: 'active',
        lastVisit: '2025-09-10T14:15:00Z',
        nextAppointment: '2024-01-21T14:30:00Z',
        assignedDoctor: 'Dr. Mohammed Alim',
        roomNumber: 'R-312',
        vitalSigns: {
          heartRate: 102,
          bloodPressure: '140/88',
          temperature: 37.5,
          oxygenSat: 89,
          respiratoryRate: 28,
        },
        medications: ['Albuterol', 'Prednisone', 'Azithromycin'],
        allergies: ['Shellfish', 'Sulfa'],
      },
    ];

    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      data: mockData,
    };
  }

  // FinTech API methods
  async processPayment(paymentData: any): Promise<ApiResponse> {
    return await this.makeRequest('/fintech/payments', 'POST', {
      action: 'process_payment',
      data: paymentData,
    });
  }

  async detectFraud(transactionData: any): Promise<ApiResponse> {
    return await this.makeRequest('/fintech/fraud', 'POST', {
      action: 'detect_fraud',
      data: transactionData,
    });
  }

  // Security & Compliance methods
  async getComplianceStatus(): Promise<ApiResponse> {
    return await this.makeRequest('/security/compliance', 'GET');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return await this.makeRequest('/health', 'GET');
  }

  // OID Management methods
  async getOidTree(): Promise<ApiResponse> {
    // Mock OID tree data for now
    const mockOidData = {
      id: '1.2.840.114494.100.1',
      name: 'Saudi Healthcare System',
      description: 'Root of Saudi Healthcare System',
      type: 'root',
      status: 'active',
      children: [
        {
          id: '1.2.840.114494.100.1.1',
          name: 'Healthcare Providers',
          description: 'All healthcare providers',
          type: 'category',
          children: [
            {
              id: '1.2.840.114494.100.1.1.1',
              name: 'King Faisal Specialist Hospital',
              description: 'Leading specialized hospital',
              type: 'provider',
              status: 'active',
            },
          ],
        },
      ],
    };

    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      data: mockOidData,
    };
  }

  async createOidNode(nodeData: any): Promise<ApiResponse> {
    return await this.makeRequest('/oid/nodes', 'POST', nodeData);
  }

  async updateOidNode(nodeId: string, nodeData: any): Promise<ApiResponse> {
    return await this.makeRequest(`/oid/nodes/${nodeId}`, 'PUT', nodeData);
  }

  async deleteOidNode(nodeId: string): Promise<ApiResponse> {
    return await this.makeRequest(`/oid/nodes/${nodeId}`, 'DELETE');
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Named exports for convenience
export const {
  getDashboardMetrics,
  getPatientRecords,
  processPayment,
  detectFraud,
  getComplianceStatus,
  healthCheck,
  getOidTree,
  createOidNode,
  updateOidNode,
  deleteOidNode,
} = apiClient;

export default apiClient;