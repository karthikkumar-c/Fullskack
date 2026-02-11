"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, Package, ShoppingCart, ArrowUpRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { getAnalyticsData, type AnalyticsData } from "@/lib/firestore"

const fallbackData: AnalyticsData = {
  totalRevenue: 1245000,
  revenueGrowth: 18,
  activeUsers: 572,
  userGrowth: 12,
  productsSold: 3847,
  productGrowth: 22,
  totalOrders: 810,
  orderGrowth: 15,
  monthlyData: [
    { month: "Jul", farmers: 380, shgs: 35, orders: 450 },
    { month: "Aug", farmers: 410, shgs: 38, orders: 520 },
    { month: "Sep", farmers: 445, shgs: 40, orders: 580 },
    { month: "Oct", farmers: 470, shgs: 42, orders: 650 },
    { month: "Nov", farmers: 495, shgs: 45, orders: 720 },
    { month: "Dec", farmers: 524, shgs: 48, orders: 810 },
  ],
  milletDistribution: [
    { name: "Finger Millet", value: 35, color: "var(--chart-1)" },
    { name: "Pearl Millet", value: 25, color: "var(--chart-2)" },
    { name: "Foxtail Millet", value: 18, color: "var(--chart-3)" },
    { name: "Sorghum", value: 15, color: "var(--chart-4)" },
    { name: "Others", value: 7, color: "var(--chart-5)" },
  ],
  revenueData: [
    { month: "Jul", revenue: 125000 },
    { month: "Aug", revenue: 148000 },
    { month: "Sep", revenue: 167000 },
    { month: "Oct", revenue: 189000 },
    { month: "Nov", revenue: 215000 },
    { month: "Dec", revenue: 245000 },
  ],
  regionData: [
    { region: "Bengaluru", farmers: 120, shgs: 12 },
    { region: "Mysuru", farmers: 85, shgs: 8 },
    { region: "Tumkur", farmers: 75, shgs: 7 },
    { region: "Hassan", farmers: 65, shgs: 6 },
    { region: "Mandya", farmers: 55, shgs: 5 },
    { region: "Others", farmers: 124, shgs: 10 },
  ],
}

const chartConfig = {
  farmers: { label: "Farmers", color: "var(--chart-1)" },
  shgs: { label: "SHGs", color: "var(--chart-2)" },
  orders: { label: "Orders", color: "var(--chart-3)" },
  revenue: { label: "Revenue", color: "var(--chart-1)" },
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(fallbackData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalyticsData()
        setAnalytics(data)
      } catch (error) {
        console.error("Error loading analytics:", error)
        setAnalytics(fallbackData)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-primary flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +{analytics.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.activeUsers}</div>
            <p className="text-xs text-primary flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +{analytics.userGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.productsSold.toLocaleString()} kg</div>
            <p className="text-xs text-primary flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +{analytics.productGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totalOrders}</div>
            <p className="text-xs text-primary flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +{analytics.orderGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Growth Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Platform Growth</CardTitle>
            <CardDescription>Monthly user and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="farmers" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)" }} />
                  <Line type="monotone" dataKey="orders" stroke="var(--chart-3)" strokeWidth={2} dot={{ fill: "var(--chart-3)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Millet Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Millet Distribution</CardTitle>
            <CardDescription>Products by millet type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.milletDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {analytics.milletDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Revenue</CardTitle>
            <CardDescription>Transaction volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(value) => `${value/1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Regional Distribution</CardTitle>
            <CardDescription>Users by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.regionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis dataKey="region" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="farmers" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
