"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, Clock, Loader2, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrdersBySeller } from "@/lib/firestore"

// Demo Farmer ID - in real app, get from auth
const DEMO_FARMER_ID = "demo-farmer-1"

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  requested: { label: "Requested", icon: Clock, color: "bg-accent text-accent-foreground" },
  placed: { label: "Requested", icon: Clock, color: "bg-accent text-accent-foreground" },
  confirmed: { label: "Confirmed", icon: Clock, color: "bg-accent text-accent-foreground" },
  picked_up: { label: "Picked Up", icon: Truck, color: "bg-primary/10 text-primary" },
  shipped: { label: "Picked Up", icon: Truck, color: "bg-primary/10 text-primary" },
  processing: { label: "Processing", icon: Truck, color: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-primary text-primary-foreground" },
  delivered: { label: "Completed", icon: CheckCircle, color: "bg-primary text-primary-foreground" },
  cancelled: { label: "Cancelled", icon: Clock, color: "bg-destructive text-destructive-foreground" },
}

export default function FarmerOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const ordersData = await getOrdersBySeller(DEMO_FARMER_ID)
        
        setOrders(ordersData.map((o: any) => ({
          id: o.id,
          shg: o.buyerName || "SHG",
          millet: o.productName || "Millet",
          quantity: o.quantity,
          price: o.totalPrice / o.quantity || 45,
          status: o.status === 'shipped' ? 'picked_up' : o.status === 'delivered' ? 'completed' : o.status,
          date: o.orderDate?.toDate?.()?.toISOString()?.split('T')[0] || '2024-01-01',
          pickupDate: o.deliveryDate?.toDate?.()?.toISOString()?.split('T')[0] || 'Pending',
        })))
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
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
        <h1 className="text-3xl font-bold text-foreground">Order Status</h1>
        <p className="text-muted-foreground">Track the status of your accepted orders</p>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === "requested" || o.status === "placed" || o.status === "confirmed").length}</p>
              <p className="text-sm text-muted-foreground">Awaiting Pickup</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === "picked_up" || o.status === "shipped" || o.status === "processing").length}</p>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === "completed" || o.status === "delivered").length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Orders</CardTitle>
          <CardDescription>Complete history of your millet orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground text-center">Orders from SHGs will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SHG</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Millet</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pickup Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.requested
                    return (
                      <tr key={order.id || index} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{order.id}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{order.shg}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{order.millet}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{order.quantity} kg</td>
                        <td className="py-3 px-4 text-sm font-medium text-primary">Rs {order.quantity * order.price}</td>
                        <td className="py-3 px-4">
                          <Badge className={status.color}>
                            <status.icon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{order.pickupDate}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
