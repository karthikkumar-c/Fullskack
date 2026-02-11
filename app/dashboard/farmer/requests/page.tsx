"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, Loader2, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRequestsForFarmer, updateRequestStatus } from "@/lib/firestore"

// Demo Farmer ID - in real app, get from auth
const DEMO_FARMER_ID = "demo-farmer-1"

export default function FarmerRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const requestsData = await getRequestsForFarmer(DEMO_FARMER_ID)
        setRequests(requestsData.map((r: any) => ({
          id: r.id,
          shgName: r.shgName || "SHG",
          contact: "9876543210",
          milletType: r.milletType,
          quantity: r.quantity,
          priceOffered: 45,
          status: r.status,
          date: r.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || '2024-01-01',
          message: "Purchase request for your millet crops.",
        })))
      } catch (error) {
        console.log("Using demo data - Firestore not connected or empty")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAccept = async (id: string) => {
    try {
      await updateRequestStatus(id, "accepted")
    } catch (error) {
      console.log("Error updating - using local state")
    }
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: "accepted" } : req
    ))
  }

  const handleReject = async (id: string) => {
    try {
      await updateRequestStatus(id, "rejected")
    } catch (error) {
      console.log("Error updating - using local state")
    }
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: "rejected" } : req
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Accepted</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
    }
  }

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
        <h1 className="text-3xl font-bold text-foreground">Purchase Requests</h1>
        <p className="text-muted-foreground">Review and respond to purchase requests from SHGs</p>
      </div>

      {requests.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No purchase requests yet</p>
            <p className="text-sm text-muted-foreground text-center">When SHGs send purchase requests, they will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request, index) => (
          <Card key={request.id || index} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg text-foreground">{request.shgName}</CardTitle>
                  <CardDescription>Contact: {request.contact}</CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Millet Type</p>
                  <p className="font-medium text-foreground">{request.milletType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium text-foreground">{request.quantity} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price Offered</p>
                  <p className="font-medium text-primary">Rs {request.priceOffered}/kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-bold text-foreground">Rs {request.quantity * request.priceOffered}</p>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Message:</p>
                <p className="text-sm text-foreground">{request.message}</p>
              </div>

              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => handleAccept(request.id)} className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="outline" onClick={() => handleReject(request.id)} className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  )
}
