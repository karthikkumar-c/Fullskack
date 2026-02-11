"use client"

import { useState, useEffect } from "react"
import { Clock, Truck, CheckCircle, Package, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllOrders, updateOrderStatus, type Order } from "@/lib/firestore"

const statusConfig = {
  placed: { label: "Pending Approval", icon: Clock, color: "bg-accent text-accent-foreground" },
  confirmed: { label: "Accepted", icon: CheckCircle, color: "bg-primary/10 text-primary" },
  processing: { label: "Processing", icon: Package, color: "bg-primary/20 text-primary" },
  shipped: { label: "Picked Up", icon: Truck, color: "bg-primary/20 text-primary" },
  delivered: { label: "Received", icon: Package, color: "bg-primary text-primary-foreground" },
  cancelled: { label: "Cancelled", icon: Clock, color: "bg-destructive text-destructive-foreground" },
}

export default function SHGOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders = await getAllOrders()
        setOrders(allOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(id, newStatus)
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
        <p className="text-muted-foreground">Manage your procurement orders from farmers</p>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusConfig).slice(0, 4).map(([key, config]) => (
          <Card key={key} className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.color}`}>
                <config.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{orders.filter(o => o.status === key).length}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Purchase Orders</CardTitle>
          <CardDescription>Track and update your procurement orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground text-center">Purchase orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.placed
                return (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{order.id}</span>
                        <Badge className={status.color}>
                          <status.icon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.buyerName} - {order.productName}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-foreground">{order.quantity} kg</span>
                        <span className="text-primary font-medium">Rs {order.totalPrice}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "confirmed" && (
                        <Button size="sm" onClick={() => handleUpdateStatus(order.id!, "shipped")}>
                          Mark as Picked Up
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button size="sm" onClick={() => handleUpdateStatus(order.id!, "delivered")}>
                          Mark as Received
                        </Button>
                      )}
                      {(order.status === "placed" || order.status === "delivered") && (
                        <Button size="sm" variant="outline" disabled>
                          {order.status === "placed" ? "Awaiting Approval" : "Completed"}
                        </Button>
                      )}
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
