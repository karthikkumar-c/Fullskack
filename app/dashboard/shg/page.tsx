"use client"

import { useState, useEffect } from "react"
import { Users, ShoppingCart, Package, Store, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSHGDashboardStats, getRecentOrdersForSHG, getActiveBatchesForSHG } from "@/lib/firestore"

// Demo SHG ID - in real app, get from auth
const DEMO_SHG_ID = "demo-shg-1"

export default function SHGDashboard() {
  const [stats, setStats] = useState([
    { label: "Farmer Connections", value: "0", icon: Users, change: "+0 this month" },
    { label: "Active Orders", value: "0", icon: ShoppingCart, change: "0 pending pickup" },
    { label: "Processing Batches", value: "0", icon: Package, change: "0 ready for sale" },
    { label: "Products Listed", value: "0", icon: Store, change: "+0 this week" },
  ])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [activeBatches, setActiveBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, ordersData, batchesData] = await Promise.all([
          getSHGDashboardStats(DEMO_SHG_ID),
          getRecentOrdersForSHG(DEMO_SHG_ID, 5),
          getActiveBatchesForSHG(DEMO_SHG_ID),
        ])

        // Update stats with real data
        setStats([
          { label: "Farmer Connections", value: String(statsData.farmerConnections || 0), icon: Users, change: "+4 this month" },
          { label: "Active Orders", value: String(statsData.activeOrders || 0), icon: ShoppingCart, change: "3 pending pickup" },
          { label: "Processing Batches", value: String(statsData.processingBatches || 0), icon: Package, change: "2 ready for sale" },
          { label: "Products Listed", value: String(statsData.productsListed || 0), icon: Store, change: "+3 this week" },
        ])

        setRecentOrders(ordersData.map((o: any) => ({
          id: o.id,
          farmer: o.buyerName || "Unknown Farmer",
          millet: o.productName || "Millet",
          quantity: `${o.quantity} ${o.unit || 'kg'}`,
          status: o.status === 'processing' ? 'Processing' : o.status === 'delivered' ? 'Received' : 'Pending Pickup',
          date: o.orderDate?.toDate?.()?.toISOString()?.split('T')[0] || '2024-01-01',
        })))

        setActiveBatches(batchesData.map((b: any) => ({
          id: b.id,
          millet: b.milletType || "Millet",
          quantity: `${b.quantity} kg`,
          stage: b.stage === 'processing' ? 'Processing' : b.stage === 'quality_check' ? 'Quality Check' : b.stage === 'packaging' ? 'Packaging' : 'Received',
          completion: b.completion || 50,
        })))
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
        <h1 className="text-3xl font-bold text-foreground">Welcome, SHG Manager</h1>
        <p className="text-muted-foreground">Manage procurement, processing, and sales</p>
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
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Procurement Orders</CardTitle>
            <CardDescription>Orders placed with farmers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={order.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{order.farmer}</p>
                      <p className="text-sm text-muted-foreground">{order.millet} - {order.quantity}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "Processing" ? "bg-primary/10 text-primary" :
                      order.status === "Received" ? "bg-primary text-primary-foreground" :
                      "bg-accent text-accent-foreground"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Batches */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Active Processing Batches</CardTitle>
            <CardDescription>Current production status</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No active batches</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBatches.map((batch, index) => (
                  <div key={batch.id || index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{batch.millet}</p>
                        <p className="text-xs text-muted-foreground">{batch.id} - {batch.quantity}</p>
                      </div>
                      <span className="text-xs text-primary font-medium">{batch.stage}</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${batch.completion}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">{batch.completion}% complete</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
