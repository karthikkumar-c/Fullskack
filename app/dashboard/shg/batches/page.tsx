"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, CheckCircle, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getAllBatches, createBatch, updateBatch, type Batch } from "@/lib/firestore"

const stages: Batch['stage'][] = ["processing", "quality_check", "packaging", "ready"]
const stageLabels: Record<string, string> = {
  received: "Received",
  processing: "Processing",
  quality_check: "Quality Check",
  packaging: "Packaging",
  ready: "Ready for Sale",
}

export default function SHGBatches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newBatch, setNewBatch] = useState({
    product: "",
    rawMaterial: "",
    inputQty: "",
    outputQty: "",
    notes: "",
  })

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const allBatches = await getAllBatches()
        setBatches(allBatches)
      } catch (error) {
        console.error("Error loading batches:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBatches()
  }, [])

  const handleAddBatch = async () => {
    if (newBatch.product && newBatch.rawMaterial && newBatch.inputQty) {
      try {
        const batchData = {
          shgId: "demo-shg",
          milletType: newBatch.rawMaterial,
          quantity: Number(newBatch.inputQty),
          stage: "processing" as const,
          completion: 10,
          farmerId: "demo-farmer",
          farmerName: "Demo Farmer",
          productName: newBatch.product,
          outputQty: Number(newBatch.outputQty) || 0,
        }
        const newId = await createBatch(batchData)
        setBatches([...batches, { id: newId, ...batchData, createdAt: new Date() }])
        setNewBatch({ product: "", rawMaterial: "", inputQty: "", outputQty: "", notes: "" })
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error creating batch:", error)
      }
    }
  }

  const handleUpdateStage = async (id: string, newStage: Batch['stage']) => {
    try {
      const completionMap: Record<string, number> = { received: 10, processing: 40, quality_check: 60, packaging: 85, ready: 100 }
      await updateBatch(id, { stage: newStage, completion: completionMap[newStage] || 50 })
      setBatches(batches.map(batch => batch.id === id ? { ...batch, stage: newStage, completion: completionMap[newStage] || 50 } : batch))
    } catch (error) {
      console.error("Error updating batch stage:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Processing Batches</h1>
          <p className="text-muted-foreground">Manage millet processing and quality details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Batch</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Processing Batch</DialogTitle>
              <DialogDescription>Enter batch details for processing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="e.g., Ragi Flour, Bajra Atta" value={newBatch.product} onChange={(e) => setNewBatch({ ...newBatch, product: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Raw Material Used</Label>
                <Input placeholder="e.g., Finger Millet, Pearl Millet" value={newBatch.rawMaterial} onChange={(e) => setNewBatch({ ...newBatch, rawMaterial: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Input Quantity (kg)</Label>
                  <Input type="number" placeholder="Raw input" value={newBatch.inputQty} onChange={(e) => setNewBatch({ ...newBatch, inputQty: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Expected Output (kg)</Label>
                  <Input type="number" placeholder="Finished product" value={newBatch.outputQty} onChange={(e) => setNewBatch({ ...newBatch, outputQty: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Processing Notes</Label>
                <Textarea placeholder="Any special instructions or notes..." value={newBatch.notes} onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })} />
              </div>
              <Button onClick={handleAddBatch} className="w-full">Create Batch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {batches.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No batches yet</p>
            <p className="text-sm text-muted-foreground text-center mb-4">Create your first processing batch to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Create Batch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {batches.map((batch) => (
            <Card key={batch.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{batch.productName || batch.milletType}</CardTitle>
                    <CardDescription>{batch.id} - Created {batch.createdAt?.toString()?.split('T')[0] || 'Recently'}</CardDescription>
                  </div>
                  <Badge className={batch.qualityApproved ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}>
                    {batch.qualityApproved ? <CheckCircle className="mr-1 h-3 w-3" /> : null}
                    {batch.qualityApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><p className="text-muted-foreground">Raw Material</p><p className="font-medium text-foreground">{batch.milletType}</p></div>
                    <div><p className="text-muted-foreground">Input</p><p className="font-medium text-foreground">{batch.quantity} kg</p></div>
                    <div><p className="text-muted-foreground">Output</p><p className="font-medium text-primary">{batch.outputQty || Math.floor(batch.quantity * 0.85)} kg</p></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Stage</span>
                      <span className="font-medium text-foreground">{stageLabels[batch.stage] || batch.stage}</span>
                    </div>
                    <div className="flex gap-1">
                      {stages.map((stage, index) => (
                        <div key={stage} className={`h-2 flex-1 rounded-full ${stages.indexOf(batch.stage) >= index ? "bg-primary" : "bg-border"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={batch.stage} onValueChange={(value) => handleUpdateStage(batch.id!, value as Batch['stage'])}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (<SelectItem key={stage} value={stage}>{stageLabels[stage]}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
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
