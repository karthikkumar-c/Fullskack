"use client"

import { useState, useEffect } from "react"
import { Search, Check, X, MoreHorizontal, User, Users, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAllUsers, approveUser, deleteUser, type User as UserType } from "@/lib/firestore"

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
      } catch (error) {
        console.error("Error loading users:", error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || user.type === filterType
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleApprove = async (id: string, type: 'farmer' | 'shg') => {
    try {
      await approveUser(id, type)
      setUsers(users.map(user => user.id === id ? { ...user, status: "active" as const } : user))
    } catch (error) {
      console.error("Error approving user:", error)
    }
  }

  const handleReject = async (id: string, type: 'farmer' | 'shg') => {
    try {
      await deleteUser(id, type)
      setUsers(users.filter(user => user.id !== id))
    } catch (error) {
      console.error("Error rejecting user:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Approve and manage farmers and SHGs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-foreground">{users.filter(u => u.type === "farmer").length}</p><p className="text-sm text-muted-foreground">Total Farmers</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-foreground">{users.filter(u => u.type === "shg").length}</p><p className="text-sm text-muted-foreground">Total SHGs</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === "active").length}</p><p className="text-sm text-muted-foreground">Active Users</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-2xl font-bold text-accent-foreground">{users.filter(u => u.status === "pending").length}</p><p className="text-sm text-muted-foreground">Pending Approval</p></CardContent></Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="User Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="farmer">Farmers</SelectItem>
            <SelectItem value="shg">SHGs</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-foreground">All Users</CardTitle><CardDescription>Manage farmers and self-help groups</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No users found</p>
                        <p className="text-sm text-muted-foreground">Users will appear here when they register</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {user.type === "farmer" ? <User className="h-4 w-4 text-muted-foreground" /> : <Users className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            {user.members && <p className="text-xs text-muted-foreground">{user.members} members</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Badge variant="secondary">{user.type === "farmer" ? "Farmer" : "SHG"}</Badge></td>
                      <td className="py-3 px-4 text-sm text-foreground">{user.location}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{user.phone}</td>
                      <td className="py-3 px-4">
                        <Badge className={user.status === "active" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}>
                          {user.status === "active" ? "Active" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(user.id!, user.type as 'farmer' | 'shg')}><Check className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(user.id!, user.type as 'farmer' | 'shg')}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
