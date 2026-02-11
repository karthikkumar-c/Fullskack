"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getListingsByFarmer, createListing, deleteListing } from "@/lib/firestore"

// Demo Farmer ID - in real app, get from auth
const DEMO_FARMER_ID = "demo-farmer-1"

const milletTypes = ["Finger Millet (Ragi)", "Pearl Millet (Bajra)", "Foxtail Millet", "Barnyard Millet", "Little Millet", "Kodo Millet", "Proso Millet", "Sorghum (Jowar)"]

export default function FarmerListings() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newListing, setNewListing] = useState({
    type: "",
    quantity: "",
    location: "",
    price: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const listingsData = await getListingsByFarmer(DEMO_FARMER_ID)
        setListings(listingsData.map((l: any) => ({
          id: l.id,
          type: l.milletType,
          quantity: l.quantity,
          unit: l.unit || "kg",
          location: l.location,
          price: l.pricePerKg,
          status: l.status === 'active' ? 'Active' : l.status === 'sold' ? 'Sold' : 'Expired',
        })))
      } catch (error) {
        console.error("Error fetching listings:", error)
        setListings([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddListing = async () => {
    if (newListing.type && newListing.quantity && newListing.location && newListing.price) {
      try {
        const newId = await createListing({
          farmerId: DEMO_FARMER_ID,
          farmerName: "Demo Farmer",
          milletType: newListing.type,
          quantity: Number(newListing.quantity),
          unit: "kg",
          location: newListing.location,
          pricePerKg: Number(newListing.price),
          status: "active",
          quality: "Grade A",
          harvestDate: new Date().toISOString().split('T')[0],
        })
        setListings([
          ...listings,
          {
            id: newId,
            type: newListing.type,
            quantity: Number(newListing.quantity),
            unit: "kg",
            location: newListing.location,
            price: Number(newListing.price),
            status: "Active",
          },
        ])
      } catch (error) {
        // Fallback to local state
        setListings([
          ...listings,
          {
            id: String(listings.length + 1),
            type: newListing.type,
            quantity: Number(newListing.quantity),
            unit: "kg",
            location: newListing.location,
            price: Number(newListing.price),
            status: "Active",
          },
        ])
      }
      setNewListing({ type: "", quantity: "", location: "", price: "" })
      setIsDialogOpen(false)
    }
  }

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListing(id)
    } catch (error) {
      console.log("Error deleting - using local state")
    }
    setListings(listings.filter(l => l.id !== id))
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Crop Listings</h1>
          <p className="text-muted-foreground">Manage your millet crop listings for sale</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Crop Listing</DialogTitle>
              <DialogDescription>Enter the details of your millet crop for sale</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="millet-type">Millet Type</Label>
                <Select value={newListing.type} onValueChange={(value) => setNewListing({ ...newListing, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select millet type" />
                  </SelectTrigger>
                  <SelectContent>
                    {milletTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={newListing.quantity}
                  onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter your location"
                  value={newListing.location}
                  onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per kg (Rs)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                />
              </div>
              <Button onClick={handleAddListing} className="w-full">Add Listing</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No listings yet</p>
            <p className="text-sm text-muted-foreground text-center mb-4">Add your first crop listing to start selling</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, index) => (
            <Card key={listing.id || index} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{listing.type}</CardTitle>
                    <CardDescription>{listing.location}</CardDescription>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    listing.status === "Active" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {listing.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="text-foreground font-medium">{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="text-foreground font-medium">Rs {listing.price}/kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="text-primary font-bold">Rs {listing.quantity * listing.price}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => handleDeleteListing(listing.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
