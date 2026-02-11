"use client"

import { useEffect, useState } from "react"
import { Package, FileText, Truck, CreditCard, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFarmerDashboardStats, getRecentRequestsForFarmer, type Request } from "@/lib/firestore"

// Demo farmer ID - in real app, get this from auth context
const DEMO_FARMER_ID = "farmer1"

interface DashboardStats {
  activeListings: number
  pendingRequests: number
  inTransitOrders: number
  totalEarnings: number
}

export default function FarmerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ activeListings: 0, pendingRequests: 0, inTransitOrders: 0, totalEarnings: 0 })
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [dashboardStats, requests] = await Promise.all([
          getFarmerDashboardStats(DEMO_FARMER_ID),
          getRecentRequestsForFarmer(DEMO_FARMER_ID, 5)
        ])
        
        setStats(dashboardStats)
        setRecentRequests(requests)
      } catch (err) {
        console.error("Error fetching data:", err)
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
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    )
  }

  const statsDisplay = [
    { label: "Active Listings", value: stats?.activeListings.toString() || "0", icon: Package, change: "+2 this week" },
    { label: "Pending Requests", value: stats?.pendingRequests.toString() || "0", icon: FileText, change: "3 new today" },
    { label: "Orders in Transit", value: stats?.inTransitOrders.toString() || "0", icon: Truck, change: "1 completed" },
    { label: "Total Earnings", value: `Rs ${stats?.totalEarnings.toLocaleString() || "0"}`, icon: CreditCard, change: "+Rs 12,400" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, Farmer</h1>
        <p className="text-muted-foreground">Manage your millet crops and track your orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Purchase Requests */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Purchase Requests</CardTitle>
          <CardDescription>Latest requests from Self-Help Groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SHG Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Millet Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No purchase requests yet</td>
                  </tr>
                ) : (
                  recentRequests.map((request) => (
                    <tr key={request.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm text-foreground">{request.shgName}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{request.milletType}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{request.quantity} kg</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "accepted" 
                            ? "bg-primary/10 text-primary" 
                            : request.status === "rejected"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent text-accent-foreground"
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {request.createdAt instanceof Date ? request.createdAt.toLocaleDateString() : new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
