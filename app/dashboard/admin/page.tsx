"use client"

import { useState, useEffect } from "react"
import { Users, Package, CheckSquare, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminDashboardStats, getRecentActivity, getPendingApprovals } from "@/lib/firestore"

// Fallback demo data
const demoStats = [
  { label: "Total Farmers", value: "524", icon: Users, change: "+12%", positive: true },
  { label: "Active SHGs", value: "48", icon: Users, change: "+8%", positive: true },
  { label: "Products Listed", value: "156", icon: Package, change: "+15%", positive: true },
  { label: "Pending Approvals", value: "12", icon: CheckSquare, change: "-5%", positive: false },
]

const demoActivity = [
  { id: 1, action: "New farmer registered", user: "Venkatesh Rao", time: "2 hours ago", type: "registration" },
  { id: 2, action: "Batch approved", batch: "BATCH045", shg: "Mahila SHG", time: "3 hours ago", type: "approval" },
  { id: 3, action: "Quality review pending", batch: "BATCH046", shg: "Green Valley SHG", time: "5 hours ago", type: "pending" },
  { id: 4, action: "New SHG registered", user: "Krishi Shakti Group", time: "1 day ago", type: "registration" },
  { id: 5, action: "Product listed", product: "Organic Ragi Flour", shg: "Sunrise SHG", time: "1 day ago", type: "product" },
]

const demoPendingApprovals = [
  { id: "1", type: "Farmer", name: "Raju Gowda", location: "Davangere", date: "2024-01-15" },
  { id: "2", type: "SHG", name: "Namma Mahila Group", location: "Bellary", date: "2024-01-14" },
  { id: "3", type: "Batch", name: "BATCH047", shg: "Sunrise SHG", date: "2024-01-15" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(demoStats)
  const [recentActivity, setRecentActivity] = useState<any[]>(demoActivity)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>(demoPendingApprovals)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, activityData, approvalsData] = await Promise.all([
          getAdminDashboardStats(),
          getRecentActivity(5),
          getPendingApprovals(),
        ])

        // Update stats with real data
        setStats([
          { label: "Total Farmers", value: String(statsData.totalFarmers || 0), icon: Users, change: "+12%", positive: true },
          { label: "Active SHGs", value: String(statsData.activeSHGs || 0), icon: Users, change: "+8%", positive: true },
          { label: "Products Listed", value: String(statsData.productsListed || 0), icon: Package, change: "+15%", positive: true },
          { label: "Pending Approvals", value: String(statsData.pendingApprovals || 0), icon: CheckSquare, change: "-5%", positive: false },
        ])

        if (activityData.length > 0) {
          setRecentActivity(activityData)
        }
        if (approvalsData.length > 0) {
          setPendingApprovals(approvalsData)
        }
      } catch (error) {
        console.log("Using demo data - Firestore not connected or empty")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage the millet supply chain platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs flex items-center gap-1 mt-1 ${stat.positive ? "text-primary" : "text-destructive"}`}>
                {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className={`h-2 w-2 mt-2 rounded-full ${
                    activity.type === "approval" ? "bg-primary" :
                    activity.type === "pending" ? "bg-accent" :
                    activity.type === "registration" ? "bg-chart-2" :
                    "bg-chart-4"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user || activity.batch || activity.product}
                      {activity.shg && ` - ${activity.shg}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Pending Approvals</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.type === "Farmer" ? "bg-chart-2/20 text-chart-2" :
                      item.type === "SHG" ? "bg-chart-1/20 text-chart-1" :
                      "bg-chart-4/20 text-chart-4"
                    }`}>
                      {item.type}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.location || item.shg}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
