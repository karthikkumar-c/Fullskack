"use client"

import { useState, useEffect } from "react"
import { Search, CheckSquare, XSquare, Package, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAdminBatches, approveBatch, rejectBatch, type AdminBatch } from "@/lib/firestore"

const fallbackBatches: AdminBatch[] = [
  { id: "BATCH047", shg: "Sunrise SHG", shgId: "shg1", product: "Little Millet Rice", quantity: "50 kg", status: "pending", qualityScore: 95, date: "2024-01-15" },
  { id: "BATCH046", shg: "Green Valley SHG", shgId: "shg2", product: "Pearl Millet Atta", quantity: "60 kg", status: "pending", qualityScore: 92, date: "2024-01-14" },
  { id: "BATCH045", shg: "Mahila SHG", shgId: "shg3", product: "Organic Ragi Flour", quantity: "85 kg", status: "approved", qualityScore: 98, date: "2024-01-12" },
  { id: "BATCH044", shg: "Nari Shakti SHG", shgId: "shg4", product: "Millet Mix Pack", quantity: "30 packs", status: "approved", qualityScore: 94, date: "2024-01-10" },
  { id: "BATCH043", shg: "Krishi Mahila Group", shgId: "shg5", product: "Jowar Flakes", quantity: "70 kg", status: "rejected", qualityScore: 78, date: "2024-01-08" },
  { id: "BATCH042", shg: "Mahila SHG", shgId: "shg3", product: "Foxtail Rice", quantity: "45 kg", status: "approved", qualityScore: 96, date: "2024-01-05" },
]

export default function AdminBatches() {
  const [batches, setBatches] = useState<AdminBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const allBatches = await getAdminBatches()
        if (allBatches.length > 0) {
          setBatches(allBatches)
        } else {
          setBatches(fallbackBatches)
        }
      } catch (error) {
        console.error("Error loading batches:", error)
        setBatches(fallbackBatches)
      } finally {
        setLoading(false)
      }
    }
    loadBatches()
  }, [])

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.shg.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || batch.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleApprove = async (id: string) => {
    try {
      await approveBatch(id)
      setBatches(batches.map(batch => batch.id === id ? { ...batch, status: "approved" as const } : batch))
    } catch (error) {
      console.error("Error approving batch:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectBatch(id)
      setBatches(batches.map(batch => batch.id === id ? { ...batch, status: "rejected" as const } : batch))
    } catch (error) {
      console.error("Error rejecting batch:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-primary/10 text-primary">Approved</Badge>
      case "rejected": return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge className="bg-accent text-accent-foreground">Pending</Badge>
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-primary"
    if (score >= 80) return "text-chart-4"
    return "text-destructive"
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Batch Approval</h1>
        <p className="text-muted-foreground">Approve or reject product batches for sale</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-foreground">{batches.length}</p><p className="text-sm text-muted-foreground">Total Batches</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-accent-foreground">{batches.filter(b => b.status === "pending").length}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{batches.filter(b => b.status === "approved").length}</p><p className="text-sm text-muted-foreground">Approved</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{batches.filter(b => b.status === "rejected").length}</p><p className="text-sm text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by batch ID, SHG, or product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-foreground">Product Batches</CardTitle><CardDescription>Review and approve batches for consumer sale</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Batch ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SHG</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Quality Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-foreground">{batch.id}</span></div></td>
                    <td className="py-3 px-4 text-sm text-foreground">{batch.shg}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{batch.product}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{batch.quantity}</td>
                    <td className="py-3 px-4"><span className={`font-bold ${getQualityColor(batch.qualityScore)}`}>{batch.qualityScore}%</span></td>
                    <td className="py-3 px-4">{getStatusBadge(batch.status)}</td>
                    <td className="py-3 px-4">
                      {batch.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(batch.id)}><CheckSquare className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(batch.id)}><XSquare className="h-4 w-4" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
