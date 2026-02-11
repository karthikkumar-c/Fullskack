"use client"

import { useState, useEffect } from "react"
import { Search, Eye, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getAllQualityReviews, updateQualityReviewStatus, type QualityReview } from "@/lib/firestore"

const fallbackReviews: QualityReview[] = [
  { id: "QR001", batchId: "BATCH045", shgId: "shg1", shgName: "Mahila SHG", product: "Organic Ragi Flour", quantity: "85 kg", status: "pending", submittedDate: "2024-01-15", moistureContent: "12%", purity: "98.5%", foreignMatter: "0.5%", notes: "Freshly processed from December harvest" },
  { id: "QR002", batchId: "BATCH046", shgId: "shg2", shgName: "Green Valley SHG", product: "Pearl Millet Atta", quantity: "60 kg", status: "pending", submittedDate: "2024-01-14", moistureContent: "11%", purity: "99%", foreignMatter: "0.3%", notes: "Premium grade bajra flour" },
  { id: "QR003", batchId: "BATCH044", shgId: "shg3", shgName: "Sunrise SHG", product: "Foxtail Millet Rice", quantity: "45 kg", status: "approved", submittedDate: "2024-01-12", moistureContent: "10%", purity: "99.2%", foreignMatter: "0.2%", notes: "High quality foxtail millet" },
  { id: "QR004", batchId: "BATCH043", shgId: "shg4", shgName: "Nari Shakti SHG", product: "Millet Mix Pack", quantity: "30 packs", status: "rejected", submittedDate: "2024-01-10", moistureContent: "15%", purity: "95%", foreignMatter: "2%", notes: "Moisture content too high", reviewerNotes: "Moisture content exceeds acceptable limit. Needs re-processing." },
]

export default function AdminQuality() {
  const [reviews, setReviews] = useState<QualityReview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const allReviews = await getAllQualityReviews()
        if (allReviews.length > 0) {
          setReviews(allReviews)
        } else {
          setReviews(fallbackReviews)
        }
      } catch (error) {
        console.error("Error loading reviews:", error)
        setReviews(fallbackReviews)
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [])

  const filteredReviews = reviews.filter(review =>
    review.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.shgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApprove = async (id: string) => {
    try {
      await updateQualityReviewStatus(id, "approved")
      setReviews(reviews.map(review => review.id === id ? { ...review, status: "approved" as const } : review))
    } catch (error) {
      console.error("Error approving review:", error)
    }
  }

  const handleReject = async (id: string) => {
    if (rejectionReason) {
      try {
        await updateQualityReviewStatus(id, "rejected", rejectionReason)
        setReviews(reviews.map(review => review.id === id ? { ...review, status: "rejected" as const, reviewerNotes: rejectionReason } : review))
        setRejectionReason("")
      } catch (error) {
        console.error("Error rejecting review:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-primary/10 text-primary"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>
      case "rejected": return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>
      default: return <Badge className="bg-accent text-accent-foreground"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quality Review</h1>
        <p className="text-muted-foreground">Review and verify quality details submitted by SHGs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border"><CardContent className="p-4 flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center"><Clock className="h-5 w-5 text-accent-foreground" /></div><div><p className="text-2xl font-bold text-foreground">{reviews.filter(r => r.status === "pending").length}</p><p className="text-sm text-muted-foreground">Pending Review</p></div></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4 flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{reviews.filter(r => r.status === "approved").length}</p><p className="text-sm text-muted-foreground">Approved</p></div></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4 flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-destructive" /></div><div><p className="text-2xl font-bold text-foreground">{reviews.filter(r => r.status === "rejected").length}</p><p className="text-sm text-muted-foreground">Rejected</p></div></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by batch ID, SHG, or product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div><CardTitle className="text-lg text-foreground">{review.product}</CardTitle><CardDescription>{review.batchId} - {review.shgName}</CardDescription></div>
                {getStatusBadge(review.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Moisture Content</p><p className="font-medium text-foreground">{review.moistureContent}</p></div>
                <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Purity</p><p className="font-medium text-foreground">{review.purity}</p></div>
                <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Foreign Matter</p><p className="font-medium text-foreground">{review.foreignMatter}</p></div>
                <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Quantity</p><p className="font-medium text-foreground">{review.quantity}</p></div>
              </div>
              <div className="p-3 bg-muted rounded-lg mb-4"><p className="text-xs text-muted-foreground mb-1">Notes from SHG</p><p className="text-sm text-foreground">{review.notes}</p></div>
              {review.reviewerNotes && (<div className="p-3 bg-destructive/10 rounded-lg mb-4"><p className="text-xs text-destructive mb-1">Rejection Reason</p><p className="text-sm text-foreground">{review.reviewerNotes}</p></div>)}
              {review.status === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(review.id!)} className="flex-1"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="outline" className="flex-1 bg-transparent"><XCircle className="mr-2 h-4 w-4" />Reject</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Reject Quality Review</DialogTitle><DialogDescription>Provide a reason for rejection</DialogDescription></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Rejection Reason</Label><Textarea placeholder="Enter the reason for rejection..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} /></div>
                        <Button variant="destructive" className="w-full" onClick={() => handleReject(review.id!)} disabled={!rejectionReason}>Confirm Rejection</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}