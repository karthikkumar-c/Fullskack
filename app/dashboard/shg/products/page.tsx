"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Eye, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getAllProducts, createProduct, type Product } from "@/lib/firestore"

interface SHGProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  batchId: string;
  status: "Active" | "Pending Approval";
  description: string;
}

export default function SHGProducts() {
  const [products, setProducts] = useState<SHGProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", stock: "", batchId: "", description: "" })

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await getAllProducts()
        const mappedProducts: SHGProduct[] = allProducts.map(p => ({
          id: p.id || '',
          name: p.name,
          category: p.category,
          price: p.pricePerKg,
          stock: p.stock,
          unit: 'kg',
          batchId: p.batchId || 'N/A',
          status: "Active" as const,
          description: p.description,
        }))
        setProducts(mappedProducts)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      try {
        const productData: Omit<Product, 'id' | 'createdAt'> = {
          name: newProduct.name,
          description: newProduct.description,
          shgId: "demo-shg",
          shgName: "Demo SHG",
          farmerId: "",
          farmerName: "",
          batchId: newProduct.batchId || "N/A",
          category: newProduct.category || "Other",
          pricePerKg: Number(newProduct.price),
          stock: Number(newProduct.stock),
          rating: 0,
          location: "Karnataka",
          harvestDate: new Date().toISOString().split('T')[0],
        }
        const newId = await createProduct(productData)
        setProducts([...products, {
          id: newId,
          name: newProduct.name,
          category: newProduct.category || "Other",
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          unit: "kg",
          batchId: newProduct.batchId || "N/A",
          status: "Pending Approval",
          description: newProduct.description,
        }])
        setNewProduct({ name: "", category: "", price: "", stock: "", batchId: "", description: "" })
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error creating product:", error)
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Products</h1>
          <p className="text-muted-foreground">Manage your finished millet products for sale</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />List New Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>List New Product</DialogTitle>
              <DialogDescription>Add a finished product for consumers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="e.g., Organic Ragi Flour" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input placeholder="e.g., Flour, Grain" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Batch ID</Label>
                  <Input placeholder="e.g., BATCH001" value={newProduct.batchId} onChange={(e) => setNewProduct({ ...newProduct, batchId: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (Rs/kg)</Label>
                  <Input type="number" placeholder="Enter price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Stock (kg)</Label>
                  <Input type="number" placeholder="Available stock" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Product description..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
              </div>
              <Button onClick={handleAddProduct} className="w-full">List Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground text-center mb-4">List your first product to start selling</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />List New Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={product.status === "Active" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}>{product.status}</Badge>
                    <span className="text-xs text-muted-foreground">Batch: {product.batchId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-border">
                    <div><p className="text-muted-foreground">Price</p><p className="font-bold text-primary">Rs {product.price}/{product.unit}</p></div>
                    <div><p className="text-muted-foreground">In Stock</p><p className="font-medium text-foreground">{product.stock} {product.unit}</p></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent"><Edit className="mr-2 h-3 w-3" />Edit</Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent"><Eye className="mr-2 h-3 w-3" />View</Button>
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
