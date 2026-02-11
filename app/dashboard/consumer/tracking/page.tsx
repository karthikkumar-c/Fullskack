"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, MapPin, Clock, User, Store, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrdersForTracking, type OrderTracking } from "@/lib/firestore"

export default function ConsumerTracking() {
  const [activeOrders, setActiveOrders] = useState<OrderTracking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // In production, use actual consumer ID from auth
        const orders = await getOrdersForTracking("demo-consumer")
        setActiveOrders(orders)
      } catch (error) {
        console.error("Error loading orders:", error)
        setActiveOrders([])
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Track Orders</h1>
        <p className="text-muted-foreground">Real-time tracking of your active orders</p>
      </div>

      {activeOrders.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No Active Orders</p>
            <p className="text-muted-foreground">All your orders have been delivered!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeOrders.map((order) => (
            <Card key={order.id} className="border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-foreground">{order.product}</CardTitle>
                    <CardDescription>Order {order.id} - {order.shg}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={order.currentStatus === "in_transit" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}>
                      {order.currentStatus === "in_transit" ? (<><Truck className="mr-1 h-3 w-3" /> In Transit</>) : (<><Clock className="mr-1 h-3 w-3" /> Processing</>)}
                    </Badge>
                    <span className="text-sm font-bold text-primary">Rs {order.price}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Estimated Delivery:</span>
                    <span className="font-medium text-foreground">{order.estimatedDelivery}</span>
                  </div>
                </div>
                <div className="relative">
                  {order.timeline.map((step, index) => (
                    <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {step.status === "Order Placed" && <Package className="h-4 w-4" />}
                          {step.status === "Order Confirmed" && <CheckCircle className="h-4 w-4" />}
                          {step.status === "Processing" && <Clock className="h-4 w-4" />}
                          {step.status === "Packed & Ready" && <Store className="h-4 w-4" />}
                          {step.status === "Out for Delivery" && <Truck className="h-4 w-4" />}
                          {step.status === "Delivered" && <User className="h-4 w-4" />}
                        </div>
                        {index < order.timeline.length - 1 && (<div className={`w-0.5 flex-1 ${step.completed ? "bg-primary" : "bg-border"}`} />)}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>{step.status}</p>
                        <p className="text-sm text-muted-foreground">{step.date} {step.time && `at ${step.time}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
