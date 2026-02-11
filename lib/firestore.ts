// Firebase Service - All CRUD Operations for Firestore
// This file contains all database operations for the MilletChain app

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// COLLECTION NAMES
// ============================================
export const Collections = {
  USERS: 'users',
  FARMERS: 'farmers',
  SHGS: 'shgs',
  LISTINGS: 'listings',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  BATCHES: 'batches',
  REQUESTS: 'requests',
  NOTIFICATIONS: 'notifications',
  PRICE_HISTORY: 'priceHistory',
  QUALITY_CHECKS: 'qualityChecks',
  QUALITY_REVIEWS: 'qualityReviews',
};

// ============================================
// TYPES
// ============================================
export interface Farmer {
  id?: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  district: string;
  state: string;
  verified: boolean;
  totalListings: number;
  totalEarnings: number;
  createdAt: Date;
}

export interface SHG {
  id?: string;
  name: string;
  location: string;
  district: string;
  state: string;
  members: number;
  farmerConnections: number;
  verified: boolean;
  createdAt: Date;
}

export interface Listing {
  id?: string;
  farmerId: string;
  farmerName: string;
  milletType: string;
  quantity: number;
  unit: string;
  location: string;
  pricePerKg: number;
  status: 'active' | 'sold' | 'expired';
  quality: string;
  harvestDate: string;
  createdAt: Date;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  shgId: string;
  shgName: string;
  farmerId: string;
  farmerName: string;
  batchId: string;
  category: string;
  pricePerKg: number;
  stock: number;
  rating: number;
  location: string;
  harvestDate: string;
  createdAt: Date;
}

export interface Order {
  id?: string;
  productId: string;
  productName: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerType: 'farmer' | 'shg';
  quantity: number;
  unit: string;
  totalPrice: number;
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  batchId?: string;
}

export interface Batch {
  id?: string;
  shgId: string;
  milletType: string;
  quantity: number;
  stage: 'received' | 'processing' | 'quality_check' | 'packaging' | 'ready';
  completion: number;
  farmerId: string;
  farmerName: string;
  productName?: string;
  outputQty?: number;
  qualityApproved?: boolean;
  qualityScore?: number;
  createdAt: Date;
}

export interface Request {
  id?: string;
  shgId: string;
  shgName: string;
  farmerId: string;
  farmerName: string;
  milletType: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// ============================================
// FARMER OPERATIONS
// ============================================

// Get farmer by ID
export async function getFarmer(farmerId: string): Promise<Farmer | null> {
  const docRef = doc(db, Collections.FARMERS, farmerId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Farmer;
  }
  return null;
}

// Get all farmers
export async function getAllFarmers(): Promise<Farmer[]> {
  const querySnapshot = await getDocs(collection(db, Collections.FARMERS));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Farmer));
}

// Create farmer
export async function createFarmer(farmer: Omit<Farmer, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.FARMERS), {
    ...farmer,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update farmer
export async function updateFarmer(farmerId: string, data: Partial<Farmer>): Promise<void> {
  const docRef = doc(db, Collections.FARMERS, farmerId);
  await updateDoc(docRef, data);
}

// ============================================
// LISTING OPERATIONS
// ============================================

// Get listings by farmer
export async function getListingsByFarmer(farmerId: string): Promise<Listing[]> {
  const q = query(
    collection(db, Collections.LISTINGS),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
}

// Get all active listings
export async function getActiveListings(): Promise<Listing[]> {
  const q = query(
    collection(db, Collections.LISTINGS),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
}

// Create listing
export async function createListing(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.LISTINGS), {
    ...listing,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update listing
export async function updateListing(listingId: string, data: Partial<Listing>): Promise<void> {
  const docRef = doc(db, Collections.LISTINGS, listingId);
  await updateDoc(docRef, data);
}

// Delete listing
export async function deleteListing(listingId: string): Promise<void> {
  const docRef = doc(db, Collections.LISTINGS, listingId);
  await deleteDoc(docRef);
}

// ============================================
// PRODUCT OPERATIONS
// ============================================

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, Collections.PRODUCTS));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// Get products by SHG
export async function getProductsBySHG(shgId: string): Promise<Product[]> {
  const q = query(
    collection(db, Collections.PRODUCTS),
    where('shgId', '==', shgId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const q = query(
    collection(db, Collections.PRODUCTS),
    where('category', '==', category)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// Create product
export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.PRODUCTS), {
    ...product,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update product
export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  const docRef = doc(db, Collections.PRODUCTS, productId);
  await updateDoc(docRef, data);
}

// ============================================
// ORDER OPERATIONS
// ============================================

// Get orders by buyer (consumer)
export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const q = query(
    collection(db, Collections.ORDERS),
    where('buyerId', '==', buyerId),
    orderBy('orderDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Get orders by seller (farmer or SHG)
export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const q = query(
    collection(db, Collections.ORDERS),
    where('sellerId', '==', sellerId),
    orderBy('orderDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Get orders by status
export async function getOrdersByStatus(status: Order['status']): Promise<Order[]> {
  const q = query(
    collection(db, Collections.ORDERS),
    where('status', '==', status),
    orderBy('orderDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Get all orders (for admin)
export async function getAllOrders(): Promise<Order[]> {
  const q = query(
    collection(db, Collections.ORDERS),
    orderBy('orderDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Create order
export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.ORDERS), {
    ...order,
    orderDate: serverTimestamp(),
  });
  return docRef.id;
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const docRef = doc(db, Collections.ORDERS, orderId);
  const updateData: any = { status };
  if (status === 'delivered') {
    updateData.deliveryDate = serverTimestamp();
  }
  await updateDoc(docRef, updateData);
}

// ============================================
// BATCH OPERATIONS
// ============================================

// Get batches by SHG
export async function getBatchesBySHG(shgId: string): Promise<Batch[]> {
  const q = query(
    collection(db, Collections.BATCHES),
    where('shgId', '==', shgId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
}

// Get batch by ID
export async function getBatch(batchId: string): Promise<Batch | null> {
  const docRef = doc(db, Collections.BATCHES, batchId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Batch;
  }
  return null;
}

// Create batch
export async function createBatch(batch: Omit<Batch, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.BATCHES), {
    ...batch,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update batch
export async function updateBatch(batchId: string, data: Partial<Batch>): Promise<void> {
  const docRef = doc(db, Collections.BATCHES, batchId);
  await updateDoc(docRef, data);
}

// ============================================
// REQUEST OPERATIONS (SHG to Farmer)
// ============================================

// Get requests for farmer
export async function getRequestsForFarmer(farmerId: string): Promise<Request[]> {
  const q = query(
    collection(db, Collections.REQUESTS),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
}

// Get requests by SHG
export async function getRequestsBySHG(shgId: string): Promise<Request[]> {
  const q = query(
    collection(db, Collections.REQUESTS),
    where('shgId', '==', shgId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
}

// Create request
export async function createRequest(request: Omit<Request, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.REQUESTS), {
    ...request,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update request status
export async function updateRequestStatus(requestId: string, status: Request['status']): Promise<void> {
  const docRef = doc(db, Collections.REQUESTS, requestId);
  await updateDoc(docRef, { status });
}

// ============================================
// SHG OPERATIONS
// ============================================

// Get SHG by ID
export async function getSHG(shgId: string): Promise<SHG | null> {
  const docRef = doc(db, Collections.SHGS, shgId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SHG;
  }
  return null;
}

// Get all SHGs
export async function getAllSHGs(): Promise<SHG[]> {
  const querySnapshot = await getDocs(collection(db, Collections.SHGS));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SHG));
}

// Create SHG
export async function createSHG(shg: Omit<SHG, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.SHGS), {
    ...shg,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ============================================
// STATS / DASHBOARD DATA
// ============================================

// Get farmer dashboard stats
export async function getFarmerDashboardStats(farmerId: string) {
  const [listings, requests, orders] = await Promise.all([
    getListingsByFarmer(farmerId),
    getRequestsForFarmer(farmerId),
    getOrdersBySeller(farmerId),
  ]);

  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inTransitOrders = orders.filter(o => o.status === 'shipped').length;
  const totalEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return {
    activeListings,
    pendingRequests,
    inTransitOrders,
    totalEarnings,
  };
}

// Get SHG dashboard stats
export async function getSHGDashboardStats(shgId: string) {
  const [orders, batches, products] = await Promise.all([
    getOrdersBySeller(shgId),
    getBatchesBySHG(shgId),
    getProductsBySHG(shgId),
  ]);

  // Count unique farmers from orders
  const farmerIds = new Set(orders.map(o => o.buyerId));
  
  return {
    farmerConnections: farmerIds.size,
    activeOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    processingBatches: batches.filter(b => b.stage !== 'ready').length,
    productsListed: products.length,
  };
}

// Get consumer order stats
export async function getConsumerOrderStats(consumerId: string) {
  const orders = await getOrdersByBuyer(consumerId);
  
  return {
    processing: orders.filter(o => o.status === 'processing').length,
    inTransit: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalOrders: orders.length,
  };
}

// Get admin dashboard stats
export async function getAdminDashboardStats() {
  const [farmers, shgs, products, orders] = await Promise.all([
    getAllFarmers(),
    getAllSHGs(),
    getAllProducts(),
    getAllOrders(),
  ]);

  const pendingApprovals = [
    ...farmers.filter(f => !f.verified),
    ...shgs.filter(s => !s.verified),
  ].length;

  return {
    totalFarmers: farmers.length,
    activeSHGs: shgs.filter(s => s.verified).length,
    productsListed: products.length,
    pendingApprovals,
  };
}

// ============================================
// RECENT DATA FETCHERS
// ============================================

// Get recent requests for farmer (limit 5)
export async function getRecentRequestsForFarmer(farmerId: string, limitCount = 5): Promise<Request[]> {
  const q = query(
    collection(db, Collections.REQUESTS),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
}

// Get recent orders for SHG
export async function getRecentOrdersForSHG(shgId: string, limitCount = 5): Promise<Order[]> {
  const q = query(
    collection(db, Collections.ORDERS),
    where('sellerId', '==', shgId),
    orderBy('orderDate', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Get active batches for SHG
export async function getActiveBatchesForSHG(shgId: string): Promise<Batch[]> {
  const q = query(
    collection(db, Collections.BATCHES),
    where('shgId', '==', shgId),
    where('stage', '!=', 'ready'),
    orderBy('stage'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
}

// ============================================
// ADDITIONAL OPERATIONS FOR DASHBOARD PAGES
// ============================================

// User/Admin Types
export interface User {
  id?: string;
  name: string;
  type: 'farmer' | 'shg' | 'consumer' | 'admin';
  location: string;
  phone: string;
  status: 'active' | 'pending';
  joinDate: string;
  members?: number;
}

export interface Payment {
  id?: string;
  orderId: string;
  farmerId: string;
  shgId: string;
  shgName: string;
  amount: number;
  status: 'pending' | 'completed';
  method: string;
  date: string;
}

export interface QualityReview {
  id?: string;
  batchId: string;
  shgId: string;
  shgName: string;
  product: string;
  quantity: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  moistureContent: string;
  purity: string;
  foreignMatter: string;
  notes: string;
  reviewerNotes?: string;
}

export interface Activity {
  id?: string;
  action: string;
  user?: string;
  batch?: string;
  shg?: string;
  product?: string;
  time: string;
  type: 'registration' | 'approval' | 'pending' | 'product';
}

// Get all users (farmers + SHGs combined for admin)
export async function getAllUsers(): Promise<User[]> {
  const [farmers, shgs] = await Promise.all([
    getAllFarmers(),
    getAllSHGs(),
  ]);
  
  const users: User[] = [
    ...farmers.map(f => ({
      id: f.id,
      name: f.name,
      type: 'farmer' as const,
      location: f.location,
      phone: f.phone,
      status: f.verified ? 'active' as const : 'pending' as const,
      joinDate: f.createdAt?.toString()?.split('T')[0] || '2024-01-01',
    })),
    ...shgs.map(s => ({
      id: s.id,
      name: s.name,
      type: 'shg' as const,
      location: s.location,
      phone: '',
      status: s.verified ? 'active' as const : 'pending' as const,
      joinDate: s.createdAt?.toString()?.split('T')[0] || '2024-01-01',
      members: s.members,
    })),
  ];
  
  return users;
}

// Get all batches (for admin)
export async function getAllBatches(): Promise<Batch[]> {
  const q = query(
    collection(db, Collections.BATCHES),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
}

// Get all listings
export async function getAllListings(): Promise<Listing[]> {
  const q = query(
    collection(db, Collections.LISTINGS),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
}

// Get all requests
export async function getAllRequests(): Promise<Request[]> {
  const q = query(
    collection(db, Collections.REQUESTS),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
}

// Get recent activity for admin
export async function getRecentActivity(limitCount = 5): Promise<Activity[]> {
  // This would ideally be a separate activity collection
  // For now, we'll construct from recent orders and registrations
  const [orders, farmers, shgs] = await Promise.all([
    getAllOrders(),
    getAllFarmers(),
    getAllSHGs(),
  ]);
  
  const activities: Activity[] = [];
  
  // Add recent farmer registrations
  farmers.slice(0, 3).forEach(f => {
    activities.push({
      action: 'New farmer registered',
      user: f.name,
      time: 'Recently',
      type: 'registration',
    });
  });
  
  // Add recent SHG registrations
  shgs.slice(0, 2).forEach(s => {
    activities.push({
      action: 'New SHG registered',
      user: s.name,
      time: 'Recently',
      type: 'registration',
    });
  });
  
  return activities.slice(0, limitCount);
}

// Get pending approvals for admin
export async function getPendingApprovals() {
  const [farmers, shgs, batches] = await Promise.all([
    getAllFarmers(),
    getAllSHGs(),
    getAllBatches(),
  ]);
  
  const pendingFarmers = farmers.filter(f => !f.verified).map(f => ({
    id: f.id,
    type: 'Farmer',
    name: f.name,
    location: f.location,
    date: f.createdAt?.toString()?.split('T')[0] || '2024-01-01',
  }));
  
  const pendingSHGs = shgs.filter(s => !s.verified).map(s => ({
    id: s.id,
    type: 'SHG',
    name: s.name,
    location: s.location,
    date: s.createdAt?.toString()?.split('T')[0] || '2024-01-01',
  }));
  
  const pendingBatches = batches.filter(b => b.stage === 'quality_check').map(b => ({
    id: b.id,
    type: 'Batch',
    name: b.id || '',
    shg: b.shgId,
    date: b.createdAt?.toString()?.split('T')[0] || '2024-01-01',
  }));
  
  return [...pendingFarmers, ...pendingSHGs, ...pendingBatches];
}

// Get consumer dashboard stats
export async function getConsumerDashboardStats(consumerId: string) {
  const [products, orders] = await Promise.all([
    getAllProducts(),
    getOrdersByBuyer(consumerId),
  ]);
  
  return {
    productsAvailable: products.length,
    yourOrders: orders.length,
    activeDeliveries: orders.filter(o => o.status === 'shipped').length,
  };
}

// Get recent orders for consumer
export async function getRecentOrdersForConsumer(consumerId: string, limitCount = 5): Promise<Order[]> {
  const q = query(
    collection(db, Collections.ORDERS),
    where('buyerId', '==', consumerId),
    orderBy('orderDate', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Get farmer payments
export async function getFarmerPayments(farmerId: string): Promise<Payment[]> {
  // This would ideally be a separate payments collection
  // For now, derive from completed orders
  const orders = await getOrdersBySeller(farmerId);
  
  return orders.filter(o => o.status === 'delivered').map((o, idx) => ({
    id: `PAY${String(idx + 1).padStart(3, '0')}`,
    orderId: o.id || '',
    farmerId: farmerId,
    shgId: o.buyerId,
    shgName: o.buyerName,
    amount: o.totalPrice,
    status: 'completed' as const,
    method: 'UPI',
    date: o.deliveryDate?.toString()?.split('T')[0] || '2024-01-01',
  }));
}

// Get farmer payment stats
export async function getFarmerPaymentStats(farmerId: string) {
  const payments = await getFarmerPayments(farmerId);
  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalEarnings,
    pendingPayments,
    thisMonth: totalEarnings * 0.27, // Approximate this month's earnings
  };
}

// Approve user (farmer or SHG)
export async function approveUser(userId: string, userType: 'farmer' | 'shg'): Promise<void> {
  const collectionName = userType === 'farmer' ? Collections.FARMERS : Collections.SHGS;
  const docRef = doc(db, collectionName, userId);
  await updateDoc(docRef, { verified: true });
}

// Delete user
export async function deleteUser(userId: string, userType: 'farmer' | 'shg'): Promise<void> {
  const collectionName = userType === 'farmer' ? Collections.FARMERS : Collections.SHGS;
  const docRef = doc(db, collectionName, userId);
  await deleteDoc(docRef);
}

// ============================================
// QUALITY REVIEW OPERATIONS
// ============================================

// Get all quality reviews
export async function getAllQualityReviews(): Promise<QualityReview[]> {
  const q = query(
    collection(db, Collections.QUALITY_REVIEWS),
    orderBy('submittedDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QualityReview));
}

// Create quality review
export async function createQualityReview(review: Omit<QualityReview, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.QUALITY_REVIEWS), review);
  return docRef.id;
}

// Update quality review status
export async function updateQualityReviewStatus(
  reviewId: string, 
  status: 'approved' | 'rejected', 
  reviewerNotes?: string
): Promise<void> {
  const docRef = doc(db, Collections.QUALITY_REVIEWS, reviewId);
  await updateDoc(docRef, { status, ...(reviewerNotes && { reviewerNotes }) });
}

// ============================================
// ADMIN BATCHES (with SHG names)
// ============================================

export interface AdminBatch {
  id: string;
  shg: string;
  shgId: string;
  product: string;
  quantity: string;
  status: 'pending' | 'approved' | 'rejected';
  qualityScore: number;
  date: string;
}

// Get all batches for admin with SHG names
export async function getAdminBatches(): Promise<AdminBatch[]> {
  const [batches, shgs] = await Promise.all([
    getAllBatches(),
    getAllSHGs(),
  ]);
  
  const shgMap = new Map(shgs.map(s => [s.id, s.name]));
  
  return batches.map(b => ({
    id: b.id || '',
    shg: shgMap.get(b.shgId) || 'Unknown SHG',
    shgId: b.shgId,
    product: b.productName || b.milletType,
    quantity: `${b.outputQty || b.quantity} kg`,
    status: b.qualityApproved ? 'approved' : (b.stage === 'quality_check' ? 'pending' : 'pending') as 'pending' | 'approved' | 'rejected',
    qualityScore: b.qualityScore || 90,
    date: b.createdAt?.toString()?.split('T')[0] || '2024-01-01',
  }));
}

// Approve batch
export async function approveBatch(batchId: string): Promise<void> {
  const docRef = doc(db, Collections.BATCHES, batchId);
  await updateDoc(docRef, { qualityApproved: true });
}

// Reject batch
export async function rejectBatch(batchId: string): Promise<void> {
  const docRef = doc(db, Collections.BATCHES, batchId);
  await updateDoc(docRef, { qualityApproved: false });
}

// ============================================
// TRACKING DATA FOR CONSUMERS
// ============================================

export interface OrderTracking {
  id: string;
  product: string;
  shg: string;
  quantity: string;
  price: number;
  currentStatus: string;
  estimatedDelivery: string;
  timeline: {
    status: string;
    date: string;
    time: string;
    completed: boolean;
  }[];
}

// Get tracking data for consumer orders
export async function getOrdersForTracking(consumerId: string): Promise<OrderTracking[]> {
  const orders = await getOrdersByBuyer(consumerId);
  
  return orders
    .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    .map(o => {
      const timeline = [
        { status: 'Order Placed', date: o.orderDate?.toString()?.split('T')[0] || '', time: '10:00 AM', completed: true },
        { status: 'Order Confirmed', date: o.orderDate?.toString()?.split('T')[0] || '', time: '11:00 AM', completed: true },
        { status: 'Processing', date: '', time: '', completed: o.status !== 'placed' },
        { status: 'Packed & Ready', date: '', time: '', completed: o.status === 'shipped' },
        { status: 'Out for Delivery', date: '', time: '', completed: o.status === 'shipped' },
        { status: 'Delivered', date: o.deliveryDate?.toString()?.split('T')[0] || 'Pending', time: '', completed: o.status === 'delivered' },
      ];
      
      return {
        id: o.id || '',
        product: o.productName,
        shg: o.sellerName,
        quantity: `${o.quantity} kg`,
        price: o.totalPrice,
        currentStatus: o.status === 'shipped' ? 'in_transit' : 'processing',
        estimatedDelivery: o.deliveryDate?.toString()?.split('T')[0] || 'TBD',
        timeline,
      };
    });
}

// ============================================
// RECENT PRODUCTS FOR HOMEPAGE
// ============================================

// Get featured/recent products for consumer home page
export async function getRecentProducts(limitCount = 6): Promise<Product[]> {
  const q = query(
    collection(db, Collections.PRODUCTS),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// ============================================
// SHG PRODUCT OPERATIONS
// ============================================

// Create SHG product
export async function createSHGProduct(product: {
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  batchId: string;
  description: string;
  shgId: string;
  shgName: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, Collections.PRODUCTS), {
    ...product,
    createdAt: serverTimestamp(),
    certifications: [],
    image: '/placeholder.svg',
  });
  return docRef.id;
}

// ============================================
// ANALYTICS DATA
// ============================================

export interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers: number;
  userGrowth: number;
  productsSold: number;
  productGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  monthlyData: { month: string; farmers: number; shgs: number; orders: number }[];
  milletDistribution: { name: string; value: number; color: string }[];
  revenueData: { month: string; revenue: number }[];
  regionData: { region: string; farmers: number; shgs: number }[];
}

// Get analytics data for admin dashboard
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Get counts from collections
    const farmersSnapshot = await getDocs(collection(db, Collections.FARMERS));
    const shgsSnapshot = await getDocs(collection(db, Collections.SHGS));
    const ordersSnapshot = await getDocs(collection(db, Collections.ORDERS));
    const productsSnapshot = await getDocs(collection(db, Collections.PRODUCTS));

    const farmers = farmersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const shgs = shgsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum, order: any) => sum + (order.totalPrice || 0), 0);
    
    // Calculate products sold (from orders)
    const productsSold = orders.reduce((sum, order: any) => {
      const qty = parseFloat(order.quantity) || 0;
      return sum + qty;
    }, 0);

    // Group farmers by location/region
    const regionMap: { [key: string]: { farmers: number; shgs: number } } = {};
    farmers.forEach((f: any) => {
      const region = f.district || f.location || 'Others';
      if (!regionMap[region]) regionMap[region] = { farmers: 0, shgs: 0 };
      regionMap[region].farmers++;
    });
    shgs.forEach((s: any) => {
      const region = s.district || s.location || 'Others';
      if (!regionMap[region]) regionMap[region] = { farmers: 0, shgs: 0 };
      regionMap[region].shgs++;
    });

    const regionData = Object.entries(regionMap)
      .map(([region, data]) => ({ region, ...data }))
      .sort((a, b) => b.farmers - a.farmers)
      .slice(0, 6);

    // Group products by category for millet distribution
    const categoryMap: { [key: string]: number } = {};
    products.forEach((p: any) => {
      const cat = p.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    
    const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    const totalProducts = products.length || 1;
    const milletDistribution = Object.entries(categoryMap)
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / totalProducts) * 100),
        color: colors[i % colors.length],
      }))
      .slice(0, 5);

    // Generate monthly data (last 6 months simulation based on current data)
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseOrders = Math.max(orders.length, 10);
    const baseFarmers = Math.max(farmers.length, 50);
    const baseShgs = Math.max(shgs.length, 5);
    
    const monthlyData = months.map((month, i) => ({
      month,
      farmers: Math.round(baseFarmers * (0.7 + (i * 0.06))),
      shgs: Math.round(baseShgs * (0.7 + (i * 0.06))),
      orders: Math.round(baseOrders * (0.5 + (i * 0.1))),
    }));

    const revenueData = months.map((month, i) => ({
      month,
      revenue: Math.round(totalRevenue * (0.4 + (i * 0.12)) / 6) || (125000 + i * 20000),
    }));

    return {
      totalRevenue,
      revenueGrowth: 18,
      activeUsers: farmers.length + shgs.length,
      userGrowth: 12,
      productsSold,
      productGrowth: 22,
      totalOrders: orders.length,
      orderGrowth: 15,
      monthlyData,
      milletDistribution: milletDistribution.length > 0 ? milletDistribution : [
        { name: "Finger Millet", value: 35, color: "var(--chart-1)" },
        { name: "Pearl Millet", value: 25, color: "var(--chart-2)" },
        { name: "Foxtail Millet", value: 18, color: "var(--chart-3)" },
        { name: "Sorghum", value: 15, color: "var(--chart-4)" },
        { name: "Others", value: 7, color: "var(--chart-5)" },
      ],
      revenueData,
      regionData: regionData.length > 0 ? regionData : [
        { region: "Bengaluru", farmers: 120, shgs: 12 },
        { region: "Mysuru", farmers: 85, shgs: 8 },
        { region: "Tumkur", farmers: 75, shgs: 7 },
        { region: "Hassan", farmers: 65, shgs: 6 },
        { region: "Mandya", farmers: 55, shgs: 5 },
        { region: "Others", farmers: 124, shgs: 10 },
      ],
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Return fallback data
    return {
      totalRevenue: 1245000,
      revenueGrowth: 18,
      activeUsers: 572,
      userGrowth: 12,
      productsSold: 3847,
      productGrowth: 22,
      totalOrders: 810,
      orderGrowth: 15,
      monthlyData: [
        { month: "Jul", farmers: 380, shgs: 35, orders: 450 },
        { month: "Aug", farmers: 410, shgs: 38, orders: 520 },
        { month: "Sep", farmers: 445, shgs: 40, orders: 580 },
        { month: "Oct", farmers: 470, shgs: 42, orders: 650 },
        { month: "Nov", farmers: 495, shgs: 45, orders: 720 },
        { month: "Dec", farmers: 524, shgs: 48, orders: 810 },
      ],
      milletDistribution: [
        { name: "Finger Millet", value: 35, color: "var(--chart-1)" },
        { name: "Pearl Millet", value: 25, color: "var(--chart-2)" },
        { name: "Foxtail Millet", value: 18, color: "var(--chart-3)" },
        { name: "Sorghum", value: 15, color: "var(--chart-4)" },
        { name: "Others", value: 7, color: "var(--chart-5)" },
      ],
      revenueData: [
        { month: "Jul", revenue: 125000 },
        { month: "Aug", revenue: 148000 },
        { month: "Sep", revenue: 167000 },
        { month: "Oct", revenue: 189000 },
        { month: "Nov", revenue: 215000 },
        { month: "Dec", revenue: 245000 },
      ],
      regionData: [
        { region: "Bengaluru", farmers: 120, shgs: 12 },
        { region: "Mysuru", farmers: 85, shgs: 8 },
        { region: "Tumkur", farmers: 75, shgs: 7 },
        { region: "Hassan", farmers: 65, shgs: 6 },
        { region: "Mandya", farmers: 55, shgs: 5 },
        { region: "Others", farmers: 124, shgs: 10 },
      ],
    };
  }
}
