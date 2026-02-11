"use client"

import { useState } from "react"
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { seedDatabase } from "@/lib/seed-data"

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSeedDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await seedDatabase()
      if (response.success) {
        setResult({ success: true, message: "Database seeded successfully! Old data cleared and fresh sample data added." })
      } else {
        setResult({ success: false, message: "Failed to seed database. Check console for errors." })
      }
    } catch (error) {
      console.error("Seed error:", error)
      setResult({ success: false, message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Database Management</h1>
        <p className="text-muted-foreground">Seed or reset your Firestore database for testing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seed Database Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5" />
              Seed Database
            </CardTitle>
            <CardDescription>
              Clears all existing data and adds fresh sample data for testing the complete flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">This will add:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>12 Users (6 farmers, 3 SHGs, 2 consumers, 1 admin)</li>
                <li>7 Listings (crop uploads by farmers)</li>
                <li>4 Verifications (SHG verifications)</li>
                <li>5 Orders (consumer purchases)</li>
                <li>2 Disputes (consumer complaints)</li>
                <li>4 Payments (farmer payment records)</li>
              </ul>
            </div>

            <div className="text-xs text-amber-500 p-2 bg-amber-500/10 rounded-md">
               This will CLEAR all existing data before seeding. Make sure you want to reset.
            </div>

            <Button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Clear & Seed Database
                </>
              )}
            </Button>

            {result && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                result.success
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                )}
                <span className="text-sm">{result.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">How It Works</CardTitle>
            <CardDescription>
              Understanding the database seeding process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">1. Clear Old Data</p>
              <p>All 6 collections are emptied first to prevent duplicates.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">2. Fixed User IDs</p>
              <p>Users get predictable IDs (farmer-1, shg-1, consumer-1, admin-1) so all references match.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">3. Cross-References</p>
              <p>Listings  Orders  Payments  Disputes are all linked with correct IDs.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">4. Login Credentials</p>
              <p>All users use password <code className="bg-muted px-1 rounded">pass123</code> (admin: <code className="bg-muted px-1 rounded">admin123</code>).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Overview */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Firestore Collections</CardTitle>
          <CardDescription>
            Overview of all collections in the new flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {[
              { name: "users", description: "All user accounts (farmers, SHGs, consumers, admin)" },
              { name: "listings", description: "Farmer crop uploads with verification status" },
              { name: "verifications", description: "SHG verification records for listings" },
              { name: "orders", description: "Consumer orders from verified listings" },
              { name: "disputes", description: "Consumer complaints on orders" },
              { name: "payments", description: "Farmer payment records for orders" },
            ].map((coll) => (
              <div key={coll.name} className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm font-medium text-foreground">{coll.name}</p>
                <p className="text-xs text-muted-foreground">{coll.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Accounts */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Test Accounts</CardTitle>
          <CardDescription>Use these credentials to log in after seeding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-foreground">Role</th>
                  <th className="text-left p-2 text-foreground">Name</th>
                  <th className="text-left p-2 text-foreground">Email</th>
                  <th className="text-left p-2 text-foreground">Password</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="p-2">Farmer</td><td className="p-2">Ramesh Kumar</td><td className="p-2">ramesh@example.com</td><td className="p-2">pass123</td></tr>
                <tr className="border-b border-border/50"><td className="p-2">Farmer</td><td className="p-2">Suresh Patil</td><td className="p-2">suresh@example.com</td><td className="p-2">pass123</td></tr>
                <tr className="border-b border-border/50"><td className="p-2">SHG</td><td className="p-2">Mahila SHG</td><td className="p-2">mahila.shg@example.com</td><td className="p-2">pass123</td></tr>
                <tr className="border-b border-border/50"><td className="p-2">Consumer</td><td className="p-2">Priya Singh</td><td className="p-2">priya@example.com</td><td className="p-2">pass123</td></tr>
                <tr className="border-b border-border/50"><td className="p-2">Admin</td><td className="p-2">Admin User</td><td className="p-2">admin@milletchain.com</td><td className="p-2">admin123</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
