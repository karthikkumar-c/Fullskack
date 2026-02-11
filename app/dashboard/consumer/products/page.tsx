"use client"

import { useState, useEffect } from "react"
import { Search, Star, ShoppingCart, Info, MapPin, User, Calendar, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getAllProducts, createOrder, type Product } from "@/lib/firestore"

const categories = ["All", "Flour", "Grain", "Mixed", "Ready to Eat"]

export default function ConsumerProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("1")

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const fetchedProducts = await getAllProducts()
        setProducts(fetchedProducts)
      } catch (err) {
        console.error("Error fetching products:", err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.shgName || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading products...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Browse Products</h1>
        <p className="text-muted-foreground">Quality millet products with full farm-to-table traceability</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or SHGs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground text-center">
              {products.length === 0 
                ? "Products will appear here once SHGs add them to the marketplace"
                : "Try adjusting your search or filter criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                    <CardDescription>{product.shgName}</CardDescription>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      {product.rating}
                    </span>
                    <span className="text-muted-foreground">{product.stock} kg available</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xl font-bold text-primary">Rs {product.pricePerKg}/kg</span>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Product Traceability</DialogTitle>
                          <DialogDescription>Full supply chain details for {product.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" /> Farmer
                              </p>
                              <p className="font-medium text-foreground">{product.farmerName}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Location
                              </p>
                              <p className="font-medium text-foreground">{product.location}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Harvest Date
                              </p>
                              <p className="font-medium text-foreground">{product.harvestDate}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground">Batch ID</p>
                              <p className="font-medium text-foreground">{product.batchId}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-sm text-foreground">
                              <strong>Supply Chain:</strong> {product.farmerName} (Farmer) → {product.shgName} (Processing) → You (Consumer)
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedProduct(product)}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Buy
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Place Order</DialogTitle>
                          <DialogDescription>Order {product.name} from {product.shgName}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-bold text-primary">Rs {product.pricePerKg}/kg</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Available</p>
                              <p className="font-medium text-foreground">{product.stock} kg</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity (kg)</Label>
                            <Input
                              type="number"
                              value={orderQuantity}
                              onChange={(e) => setOrderQuantity(e.target.value)}
                              min="1"
                              max={product.stock}
                            />
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Subtotal</span>
                              <span>Rs {Number(orderQuantity) * product.pricePerKg}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Delivery</span>
                              <span>Rs 50</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-border">
                              <span>Total</span>
                              <span className="text-primary">Rs {Number(orderQuantity) * product.pricePerKg + 50}</span>
                            </div>
                          </div>
                          <Button className="w-full">Confirm Order</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  )
}
