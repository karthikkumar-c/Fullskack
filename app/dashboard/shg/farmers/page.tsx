"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Phone, ShoppingCart, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getActiveListings } from "@/lib/firestore"

export default function SHGFarmers() {
  const [farmerListings, setFarmerListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const listingsData = await getActiveListings()
        setFarmerListings(listingsData.map((l: any) => ({
          id: l.id,
          farmer: l.farmerName || "Unknown Farmer",
          phone: "9876543210",
          location: l.location,
          millet: l.milletType,
          quantity: l.quantity,
          price: l.pricePerKg,
          quality: l.quality || "Grade A",
        })))
      } catch (error) {
        console.log("Using demo data - Firestore not connected or empty")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredListings = farmerListings.filter(
    (listing) =>
      listing.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.millet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-foreground">Farmer Listings</h1>
        <p className="text-muted-foreground">Browse and purchase millets from registered farmers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by farmer, millet, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No farmer listings yet</p>
            <p className="text-sm text-muted-foreground text-center">When farmers list their products, they will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing, index) => (
            <Card key={listing.id || index} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{listing.millet}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location}
                    </CardDescription>
                  </div>
                  <Badge className={listing.quality === "Grade A" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}>
                    {listing.quality}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{listing.farmer}</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {listing.phone}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-medium text-foreground">{listing.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium text-primary">Rs {listing.price}/kg</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedFarmer(listing)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Place Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Place Purchase Order</DialogTitle>
                        <DialogDescription>Order {listing.millet} from {listing.farmer}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Available Quantity</p>
                            <p className="font-medium text-foreground">{listing.quantity} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price per kg</p>
                            <p className="font-medium text-primary">Rs {listing.price}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Order Quantity (kg)</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="Enter quantity"
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(e.target.value)}
                            max={listing.quantity}
                          />
                        </div>
                        {orderQuantity && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-xl font-bold text-primary">Rs {Number(orderQuantity) * listing.price}</p>
                          </div>
                        )}
                        <Button className="w-full" disabled={!orderQuantity}>
                          Confirm Order
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
