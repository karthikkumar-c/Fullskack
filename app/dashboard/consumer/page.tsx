"use client"

import { useState, useEffect } from "react"
import { Store, ShoppingBag, MapPin, Star, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getConsumerDashboardStats, getAllProducts, getRecentOrdersForConsumer } from "@/lib/firestore"

// Demo Consumer ID - in real app, get from auth
const DEMO_CONSUMER_ID = "demo-consumer-1"

export default function ConsumerDashboard() {
  const [stats, setStats] = useState([
    { label: "Products Available", value: "0", icon: Store },
    { label: "Your Orders", value: "0", icon: ShoppingBag },
    { label: "Active Deliveries", value: "0", icon: MapPin },
  ])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, productsData, ordersData] = await Promise.all([
          getConsumerDashboardStats(DEMO_CONSUMER_ID),
          getAllProducts(),
          getRecentOrdersForConsumer(DEMO_CONSUMER_ID, 5),
        ])

        // Update stats
        setStats([
          { label: "Products Available", value: String(statsData.productsAvailable || productsData.length || 0), icon: Store },
          { label: "Your Orders", value: String(statsData.yourOrders || 0), icon: ShoppingBag },
          { label: "Active Deliveries", value: String(statsData.activeDeliveries || 0), icon: MapPin },
        ])

        // Update products
        if (productsData.length > 0) {
          setFeaturedProducts(productsData.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            shg: p.shgName || "Local SHG",
            price: p.pricePerKg || 0,
            rating: p.rating || 4.5,
            category: p.category || "Other",
          })))
        }

        // Update orders
        if (ordersData.length > 0) {
          setRecentOrders(ordersData.map((o: any) => ({
            id: o.id,
            product: o.productName,
            quantity: `${o.quantity} ${o.unit || 'kg'}`,
            status: o.status === 'delivered' ? 'Delivered' : o.status === 'shipped' ? 'In Transit' : 'Processing',
            date: o.orderDate?.toDate?.()?.toISOString()?.split('T')[0] || '2024-01-01',
          })))
        }
      } catch (error) {
        console.log("Error fetching data:", error)
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
        <h1 className="text-3xl font-bold text-foreground">Welcome, Consumer</h1>
        <p className="text-muted-foreground">Browse quality millet products with full traceability</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Featured Products */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Featured Products</CardTitle>
                <CardDescription>Popular millet products</CardDescription>
              </div>
              <Link href="/dashboard/consumer/products">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featuredProducts.map((product, index) => (
                <div key={product.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.shg}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rs {product.price}/kg</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {product.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </div>
              <Link href="/dashboard/consumer/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{order.product}</p>
                    <p className="text-sm text-muted-foreground">{order.id} - {order.quantity}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === "Delivered" ? "bg-primary text-primary-foreground" :
                    order.status === "In Transit" ? "bg-primary/10 text-primary" :
                    "bg-accent text-accent-foreground"
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
