import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-static';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";

    // Simulate real-time dashboard data
    const dashboardData = {
      overview: {
        patients: {
          total: 12847,
          active: 8932,
          newToday: 47,
          criticalAlerts: 3,
          trend: 12.5,
        },
        appointments: {
          today: 156,
          upcoming: 234,
          completed: 142,
          cancelled: 8,
          trend: 8.3,
        },
        revenue: {
          total: 2847392,
          thisMonth: 584720,
          lastMonth: 523180,
          claims: 1247,
          trend: 15.7,
        },
        compliance: {
          hipaaScore: 98.5,
          nphiesCompliance: 94.7,
          securityScore: 99.2,
          auditsPassed: 47,
        },
        aiInsights: {
          transcriptionAccuracy: 97.2,
          imagingAnalysis: 96.8,
          fraudDetection: 98.5,
          predictiveAlerts: 94.3,
        },
      },
      alerts: [
        {
          id: "1",
          patientId: "P001",
          patientName: "أحمد محمد العلي",
          type: "critical",
          message:
            "Critical vital signs detected - immediate attention required",
          timestamp: "2 minutes ago",
          acknowledged: false,
          priority: "high",
        },
        {
          id: "2",
          patientId: "P002",
          patientName: "Sarah Johnson",
          type: "warning",
          message: "Medication refill due in 2 days",
          timestamp: "15 minutes ago",
          acknowledged: false,
          priority: "medium",
        },
      ],
      activities: [
        {
          id: "1",
          type: "payment",
          description: "Insurance claim processed successfully",
          timestamp: "5 minutes ago",
          status: "completed",
          amount: 2500,
          patientName: "محمد أحمد",
        },
        {
          id: "2",
          type: "imaging",
          description: "MRI scan analysis completed",
          timestamp: "12 minutes ago",
          status: "completed",
          patientName: "Lisa Chen",
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "acknowledge_alert":
        // Handle alert acknowledgment
        return NextResponse.json({
          success: true,
          message: "Alert acknowledged successfully",
        });

      case "refresh_data":
        // Handle data refresh request
        return NextResponse.json({
          success: true,
          message: "Dashboard data refreshed",
          timestamp: new Date().toISOString(),
        });

      case "update_settings":
        // Handle settings update
        return NextResponse.json({
          success: true,
          message: "Settings updated successfully",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Dashboard action error:", error);
    return NextResponse.json(
      { success: false, error: "Action failed" },
      { status: 500 }
    );
  }
}
