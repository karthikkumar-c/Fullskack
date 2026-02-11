"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, Clock, Loader2, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getOrdersByBuyer } from "@/lib/firestore"

// Demo Consumer ID - in real app, get from auth
const DEMO_CONSUMER_ID = "demo-consumer-1"

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  processing: { label: "Processing", icon: Clock, color: "bg-accent text-accent-foreground" },
  in_transit: { label: "In Transit", icon: Truck, color: "bg-primary/10 text-primary" },
  shipped: { label: "In Transit", icon: Truck, color: "bg-primary/10 text-primary" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-primary text-primary-foreground" },
  placed: { label: "Placed", icon: Clock, color: "bg-accent text-accent-foreground" },
  confirmed: { label: "Confirmed", icon: Clock, color: "bg-accent text-accent-foreground" },
  cancelled: { label: "Cancelled", icon: Clock, color: "bg-destructive text-destructive-foreground" },
}

export default function ConsumerOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const ordersData = await getOrdersByBuyer(DEMO_CONSUMER_ID)
        
        if (ordersData.length > 0) {
          setOrders(ordersData.map((o: any) => ({
            id: o.id,
            product: o.productName,
            shg: o.sellerName || "Local SHG",
            quantity: o.quantity,
            unit: o.unit || "kg",
            price: o.totalPrice,
            status: o.status === 'shipped' ? 'in_transit' : o.status,
            orderDate: o.orderDate?.toDate?.()?.toISOString()?.split('T')[0] || '2024-01-01',
            deliveryDate: o.deliveryDate?.toDate?.()?.toISOString()?.split('T')[0] || 'Pending',
          })))
        }
      } catch (error) {
        console.error("Error loading orders:", error)
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
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your millet product orders</p>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === "processing").length}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === "in_transit" || o.status === "shipped").length}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === "delivered").length}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Order History</CardTitle>
          <CardDescription>All your millet product orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground">Your orders will appear here once you make a purchase</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/consumer/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.processing
                return (
                  <div key={order.id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order.product}</p>
                        <p className="text-sm text-muted-foreground">{order.shg} - {order.quantity} {order.unit}</p>
                        <p className="text-xs text-muted-foreground mt-1">Ordered: {order.orderDate}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <Badge className={status.color}>
                        <status.icon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                      <p className="text-sm font-bold text-primary">Rs {order.price}</p>
                      <p className="text-xs text-muted-foreground">{order.deliveryDate}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
