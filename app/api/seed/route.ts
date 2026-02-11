// API Route to seed the database
// Access via: http://localhost:3000/api/seed

import { NextResponse } from 'next/server';
import { 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================
// SEED DATA
// ============================================

// Users
const usersData = [
  // Admin
  { name: "Admin User", phone: "9000000001", role: "admin", address: "MilletChain HQ, MG Road", district: "Bengaluru Urban", state: "Karnataka", pincode: "560001", email: "admin@milletchain.com", password: "admin123", verified: true, createdAt: Timestamp.now() },

  // Farmers
  { name: "Ramesh Kumar", phone: "9876543210", role: "farmer", address: "Village Kote, Devanahalli Taluk", district: "Bengaluru Rural", state: "Karnataka", pincode: "562110", email: "ramesh@example.com", password: "farmer123", verified: true, createdAt: Timestamp.now() },
  { name: "Suresh Patil", phone: "9876543211", role: "farmer", address: "Gubbi Hobli, Near Bus Stand", district: "Tumkur", state: "Karnataka", pincode: "572216", email: "suresh@example.com", password: "farmer123", verified: true, createdAt: Timestamp.now() },
  { name: "Lakshmi Devi", phone: "9876543212", role: "farmer", address: "Nanjangud Road, T Narasipura", district: "Mysuru", state: "Karnataka", pincode: "571124", email: "lakshmi@example.com", password: "farmer123", verified: true, createdAt: Timestamp.now() },
  { name: "Mahesh Gowda", phone: "9876543213", role: "farmer", address: "Sakleshpur Main Road", district: "Hassan", state: "Karnataka", pincode: "573134", email: "mahesh@example.com", password: "farmer123", verified: true, createdAt: Timestamp.now() },
  { name: "Anita Sharma", phone: "9876543214", role: "farmer", address: "KR Pet Taluk, Near Temple", district: "Mandya", state: "Karnataka", pincode: "571426", email: "anita@example.com", password: "farmer123", verified: true, createdAt: Timestamp.now() },
  { name: "Venkatesh Rao", phone: "9876543215", role: "farmer", address: "Challakere Road, Hosadurga", district: "Chitradurga", state: "Karnataka", pincode: "577527", email: "", password: "farmer123", verified: false, createdAt: Timestamp.now() },

  // SHGs
  { name: "Mahila SHG", phone: "9876543220", role: "shg", address: "Jayanagar 4th Block, 36th Cross", district: "Bengaluru Urban", state: "Karnataka", pincode: "560041", email: "mahila@shg.com", password: "shg123", verified: true, createdAt: Timestamp.now() },
  { name: "Green Valley SHG", phone: "9876543221", role: "shg", address: "Vijayanagar 2nd Stage, Mysuru", district: "Mysuru", state: "Karnataka", pincode: "570017", email: "greenvalley@shg.com", password: "shg123", verified: true, createdAt: Timestamp.now() },
  { name: "Sunrise SHG", phone: "9876543222", role: "shg", address: "SS Puram, Near Market", district: "Tumkur", state: "Karnataka", pincode: "572102", email: "sunrise@shg.com", password: "shg123", verified: true, createdAt: Timestamp.now() },

  // Consumers
  { name: "Priya Singh", phone: "9876543230", role: "consumer", address: "Indiranagar, 100 Feet Road", district: "Bengaluru Urban", state: "Karnataka", pincode: "560038", email: "priya@example.com", password: "consumer123", verified: true, createdAt: Timestamp.now() },
  { name: "Amit Verma", phone: "9876543231", role: "consumer", address: "Gokulam 3rd Stage, Mysuru", district: "Mysuru", state: "Karnataka", pincode: "570002", email: "amit@example.com", password: "consumer123", verified: true, createdAt: Timestamp.now() },
];

// Farmers
const farmersData = [
  { name: "Ramesh Kumar", phone: "9876543210", email: "ramesh@example.com", location: "Bengaluru Rural", district: "Bengaluru Rural", state: "Karnataka", verified: true, totalListings: 5, totalEarnings: 125000, createdAt: Timestamp.now() },
  { name: "Suresh Patil", phone: "9876543211", email: "suresh@example.com", location: "Tumkur", district: "Tumkur", state: "Karnataka", verified: true, totalListings: 3, totalEarnings: 85000, createdAt: Timestamp.now() },
  { name: "Lakshmi Devi", phone: "9876543212", email: "lakshmi@example.com", location: "Mysuru", district: "Mysuru", state: "Karnataka", verified: true, totalListings: 4, totalEarnings: 95000, createdAt: Timestamp.now() },
  { name: "Mahesh Gowda", phone: "9876543213", email: "mahesh@example.com", location: "Hassan", district: "Hassan", state: "Karnataka", verified: true, totalListings: 6, totalEarnings: 150000, createdAt: Timestamp.now() },
  { name: "Anita Sharma", phone: "9876543214", email: "anita@example.com", location: "Mandya", district: "Mandya", state: "Karnataka", verified: true, totalListings: 2, totalEarnings: 45000, createdAt: Timestamp.now() },
  { name: "Venkatesh Rao", phone: "9876543215", email: "venkatesh@example.com", location: "Chitradurga", district: "Chitradurga", state: "Karnataka", verified: false, totalListings: 1, totalEarnings: 20000, createdAt: Timestamp.now() },
];

// SHGs
const shgsData = [
  { name: "Mahila SHG", location: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", members: 15, farmerConnections: 24, verified: true, createdAt: Timestamp.now() },
  { name: "Green Valley SHG", location: "Mysuru", district: "Mysuru", state: "Karnataka", members: 12, farmerConnections: 18, verified: true, createdAt: Timestamp.now() },
  { name: "Sunrise SHG", location: "Tumkur", district: "Tumkur", state: "Karnataka", members: 10, farmerConnections: 15, verified: true, createdAt: Timestamp.now() },
  { name: "Krishi Mahila Group", location: "Hassan", district: "Hassan", state: "Karnataka", members: 8, farmerConnections: 12, verified: true, createdAt: Timestamp.now() },
];

// Listings (Farmer crop listings)
const listingsData = [
  { farmerId: "farmer-1", farmerName: "Ramesh Kumar", milletType: "Finger Millet (Ragi)", quantity: 200, unit: "kg", location: "Bengaluru Rural", pricePerKg: 45, status: "active", quality: "Grade A", harvestDate: "2024-01-10", createdAt: Timestamp.now() },
  { farmerId: "farmer-2", farmerName: "Suresh Patil", milletType: "Pearl Millet (Bajra)", quantity: 150, unit: "kg", location: "Tumkur", pricePerKg: 38, status: "active", quality: "Grade A", harvestDate: "2024-01-08", createdAt: Timestamp.now() },
  { farmerId: "farmer-3", farmerName: "Lakshmi Devi", milletType: "Foxtail Millet", quantity: 100, unit: "kg", location: "Mysuru", pricePerKg: 52, status: "active", quality: "Grade B", harvestDate: "2024-01-12", createdAt: Timestamp.now() },
  { farmerId: "farmer-4", farmerName: "Mahesh Gowda", milletType: "Sorghum (Jowar)", quantity: 300, unit: "kg", location: "Hassan", pricePerKg: 35, status: "active", quality: "Grade A", harvestDate: "2024-01-05", createdAt: Timestamp.now() },
  { farmerId: "farmer-5", farmerName: "Anita Sharma", milletType: "Little Millet", quantity: 80, unit: "kg", location: "Mandya", pricePerKg: 60, status: "active", quality: "Grade A", harvestDate: "2024-01-11", createdAt: Timestamp.now() },
  { farmerId: "farmer-6", farmerName: "Venkatesh Rao", milletType: "Kodo Millet", quantity: 120, unit: "kg", location: "Chitradurga", pricePerKg: 55, status: "active", quality: "Grade B", harvestDate: "2024-01-09", createdAt: Timestamp.now() },
];

// Products (SHG processed products for consumers)
const productsData = [
  { name: "Organic Ragi Flour", description: "Stone-ground organic finger millet flour, perfect for making healthy rotis and dosas", shgId: "shg-1", shgName: "Mahila SHG", farmerId: "farmer-1", farmerName: "Ramesh Kumar", batchId: "BATCH001", category: "Flour", pricePerKg: 85, stock: 50, rating: 4.5, location: "Bengaluru", harvestDate: "2024-01-10", createdAt: Timestamp.now() },
  { name: "Bajra Atta Premium", description: "Fine pearl millet flour for rotis, rich in iron and fiber", shgId: "shg-1", shgName: "Mahila SHG", farmerId: "farmer-2", farmerName: "Suresh Patil", batchId: "BATCH002", category: "Flour", pricePerKg: 75, stock: 40, rating: 4.3, location: "Tumkur", harvestDate: "2024-01-08", createdAt: Timestamp.now() },
  { name: "Foxtail Millet Rice", description: "Polished foxtail millet ready to cook, great for diabetes management", shgId: "shg-2", shgName: "Green Valley SHG", farmerId: "farmer-3", farmerName: "Lakshmi Devi", batchId: "BATCH003", category: "Grain", pricePerKg: 120, stock: 30, rating: 4.7, location: "Mysuru", harvestDate: "2024-01-12", createdAt: Timestamp.now() },
  { name: "Millet Mix Pack", description: "Assorted millets combo pack - 5 varieties for complete nutrition", shgId: "shg-2", shgName: "Green Valley SHG", farmerId: "farmer-4", farmerName: "Mahesh Gowda", batchId: "BATCH004", category: "Mixed", pricePerKg: 150, stock: 25, rating: 4.6, location: "Hassan", harvestDate: "2024-01-05", createdAt: Timestamp.now() },
  { name: "Jowar Flakes", description: "Crispy sorghum flakes for breakfast, healthy alternative to corn flakes", shgId: "shg-3", shgName: "Sunrise SHG", farmerId: "farmer-4", farmerName: "Mahesh Gowda", batchId: "BATCH005", category: "Ready to Eat", pricePerKg: 95, stock: 60, rating: 4.4, location: "Tumkur", harvestDate: "2024-01-05", createdAt: Timestamp.now() },
  { name: "Little Millet Grain", description: "Premium quality little millet, perfect for rice replacement", shgId: "shg-3", shgName: "Sunrise SHG", farmerId: "farmer-5", farmerName: "Anita Sharma", batchId: "BATCH006", category: "Grain", pricePerKg: 110, stock: 35, rating: 4.2, location: "Mandya", harvestDate: "2024-01-11", createdAt: Timestamp.now() },
];

// Orders
const ordersData = [
  // Consumer orders
  { productId: "prod-1", productName: "Organic Ragi Flour", buyerId: "consumer-1", buyerName: "Priya Singh", sellerId: "shg-1", sellerName: "Mahila SHG", sellerType: "shg", quantity: 5, unit: "kg", totalPrice: 425, status: "delivered", orderDate: Timestamp.fromDate(new Date("2024-01-10")), deliveryDate: Timestamp.fromDate(new Date("2024-01-14")) },
  { productId: "prod-2", productName: "Bajra Atta Premium", buyerId: "consumer-1", buyerName: "Priya Singh", sellerId: "shg-1", sellerName: "Mahila SHG", sellerType: "shg", quantity: 3, unit: "kg", totalPrice: 225, status: "shipped", orderDate: Timestamp.fromDate(new Date("2024-01-12")) },
  { productId: "prod-3", productName: "Foxtail Millet Rice", buyerId: "consumer-2", buyerName: "Amit Verma", sellerId: "shg-2", sellerName: "Green Valley SHG", sellerType: "shg", quantity: 2, unit: "kg", totalPrice: 240, status: "processing", orderDate: Timestamp.fromDate(new Date("2024-01-14")) },
  { productId: "prod-4", productName: "Millet Mix Pack", buyerId: "consumer-2", buyerName: "Amit Verma", sellerId: "shg-2", sellerName: "Green Valley SHG", sellerType: "shg", quantity: 1, unit: "pack", totalPrice: 150, status: "placed", orderDate: Timestamp.fromDate(new Date("2024-01-15")) },
  // SHG procurement orders from farmers
  { productId: "listing-1", productName: "Finger Millet (Ragi)", buyerId: "shg-1", buyerName: "Mahila SHG", sellerId: "farmer-1", sellerName: "Ramesh Kumar", sellerType: "farmer", quantity: 100, unit: "kg", totalPrice: 4500, status: "delivered", orderDate: Timestamp.fromDate(new Date("2024-01-08")), deliveryDate: Timestamp.fromDate(new Date("2024-01-10")) },
  { productId: "listing-2", productName: "Pearl Millet (Bajra)", buyerId: "shg-1", buyerName: "Mahila SHG", sellerId: "farmer-2", sellerName: "Suresh Patil", sellerType: "farmer", quantity: 75, unit: "kg", totalPrice: 2850, status: "confirmed", orderDate: Timestamp.fromDate(new Date("2024-01-12")) },
  { productId: "listing-3", productName: "Foxtail Millet", buyerId: "shg-2", buyerName: "Green Valley SHG", sellerId: "farmer-3", sellerName: "Lakshmi Devi", sellerType: "farmer", quantity: 50, unit: "kg", totalPrice: 2600, status: "shipped", orderDate: Timestamp.fromDate(new Date("2024-01-11")) },
  { productId: "listing-4", productName: "Sorghum (Jowar)", buyerId: "shg-3", buyerName: "Sunrise SHG", sellerId: "farmer-4", sellerName: "Mahesh Gowda", sellerType: "farmer", quantity: 80, unit: "kg", totalPrice: 2800, status: "processing", orderDate: Timestamp.fromDate(new Date("2024-01-13")) },
];

// Batches (SHG processing batches)
const batchesData = [
  { shgId: "shg-1", milletType: "Finger Millet", quantity: 100, stage: "packaging", completion: 85, farmerId: "farmer-1", farmerName: "Ramesh Kumar", productName: "Ragi Flour", outputQty: 85, qualityApproved: true, qualityScore: 92, createdAt: Timestamp.fromDate(new Date("2024-01-12")) },
  { shgId: "shg-1", milletType: "Pearl Millet", quantity: 75, stage: "processing", completion: 40, farmerId: "farmer-2", farmerName: "Suresh Patil", productName: "Bajra Atta", outputQty: 60, qualityApproved: false, createdAt: Timestamp.fromDate(new Date("2024-01-14")) },
  { shgId: "shg-2", milletType: "Foxtail Millet", quantity: 50, stage: "quality_check", completion: 60, farmerId: "farmer-3", farmerName: "Lakshmi Devi", productName: "Foxtail Rice", outputQty: 45, qualityApproved: false, createdAt: Timestamp.fromDate(new Date("2024-01-15")) },
  { shgId: "shg-2", milletType: "Sorghum", quantity: 80, stage: "ready", completion: 100, farmerId: "farmer-4", farmerName: "Mahesh Gowda", productName: "Jowar Flakes", outputQty: 70, qualityApproved: true, qualityScore: 88, createdAt: Timestamp.fromDate(new Date("2024-01-10")) },
  { shgId: "shg-3", milletType: "Little Millet", quantity: 60, stage: "received", completion: 10, farmerId: "farmer-5", farmerName: "Anita Sharma", productName: "Little Millet Grain", outputQty: 0, qualityApproved: false, createdAt: Timestamp.fromDate(new Date("2024-01-16")) },
];

// Requests (SHG purchase requests to farmers)
const requestsData = [
  { shgId: "shg-1", shgName: "Mahila SHG", farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", milletType: "Finger Millet (Ragi)", quantity: 50, status: "pending", createdAt: Timestamp.fromDate(new Date("2024-01-15")) },
  { shgId: "shg-2", shgName: "Green Valley SHG", farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", milletType: "Pearl Millet (Bajra)", quantity: 100, status: "pending", createdAt: Timestamp.fromDate(new Date("2024-01-14")) },
  { shgId: "shg-3", shgName: "Sunrise SHG", farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", milletType: "Foxtail Millet", quantity: 30, status: "accepted", createdAt: Timestamp.fromDate(new Date("2024-01-13")) },
  { shgId: "shg-4", shgName: "Krishi Mahila Group", farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", milletType: "Sorghum (Jowar)", quantity: 80, status: "rejected", createdAt: Timestamp.fromDate(new Date("2024-01-12")) },
];

// Quality Checks (Admin quality reviews)
const qualityChecksData = [
  { batchId: "BATCH001", shgId: "shg-1", shgName: "Mahila SHG", productName: "Ragi Flour", milletType: "Finger Millet", status: "approved", score: 92, reviewedBy: "admin-1", reviewedAt: Timestamp.fromDate(new Date("2024-01-14")), notes: "Excellent quality, meets all standards", createdAt: Timestamp.fromDate(new Date("2024-01-13")) },
  { batchId: "BATCH004", shgId: "shg-2", shgName: "Green Valley SHG", productName: "Jowar Flakes", milletType: "Sorghum", status: "approved", score: 88, reviewedBy: "admin-1", reviewedAt: Timestamp.fromDate(new Date("2024-01-12")), notes: "Good quality, minor improvements possible", createdAt: Timestamp.fromDate(new Date("2024-01-11")) },
  { batchId: "BATCH002", shgId: "shg-1", shgName: "Mahila SHG", productName: "Bajra Atta", milletType: "Pearl Millet", status: "pending", score: 0, createdAt: Timestamp.fromDate(new Date("2024-01-15")) },
  { batchId: "BATCH003", shgId: "shg-2", shgName: "Green Valley SHG", productName: "Foxtail Rice", milletType: "Foxtail Millet", status: "pending", score: 0, createdAt: Timestamp.fromDate(new Date("2024-01-16")) },
];

// Payments (Farmer payment records)
const paymentsData = [
  { farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", orderId: "order-1", shgId: "shg-1", shgName: "Mahila SHG", amount: 4500, method: "Bank Transfer", status: "completed", date: "2024-01-12", createdAt: Timestamp.now() },
  { farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", orderId: "order-2", shgId: "shg-2", shgName: "Green Valley SHG", amount: 3200, method: "UPI", status: "completed", date: "2024-01-10", createdAt: Timestamp.now() },
  { farmerId: "demo-farmer-1", farmerName: "Ramesh Kumar", orderId: "order-3", shgId: "shg-3", shgName: "Sunrise SHG", amount: 2800, method: "Bank Transfer", status: "pending", date: "2024-01-15", createdAt: Timestamp.now() },
  { farmerId: "farmer-2", farmerName: "Suresh Patil", orderId: "order-4", shgId: "shg-1", shgName: "Mahila SHG", amount: 2850, method: "UPI", status: "completed", date: "2024-01-13", createdAt: Timestamp.now() },
];

// Price History (for analytics)
const priceHistoryData = [
  { milletType: "Finger Millet (Ragi)", price: 45, date: "2024-01-01", createdAt: Timestamp.now() },
  { milletType: "Finger Millet (Ragi)", price: 46, date: "2024-01-08", createdAt: Timestamp.now() },
  { milletType: "Finger Millet (Ragi)", price: 47, date: "2024-01-15", createdAt: Timestamp.now() },
  { milletType: "Pearl Millet (Bajra)", price: 38, date: "2024-01-01", createdAt: Timestamp.now() },
  { milletType: "Pearl Millet (Bajra)", price: 39, date: "2024-01-08", createdAt: Timestamp.now() },
  { milletType: "Foxtail Millet", price: 52, date: "2024-01-01", createdAt: Timestamp.now() },
  { milletType: "Sorghum (Jowar)", price: 35, date: "2024-01-01", createdAt: Timestamp.now() },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

async function clearCollection(collectionName: string): Promise<number> {
  const snapshot = await getDocs(collection(db, collectionName));
  const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
  return snapshot.size;
}

async function seedCollection(collectionName: string, data: any[]): Promise<number> {
  for (const item of data) {
    await addDoc(collection(db, collectionName), item);
  }
  return data.length;
}

// ============================================
// API ROUTE HANDLER
// ============================================

export async function GET() {
  try {
    const results: any = {
      cleared: {},
      seeded: {},
    };
    
    // Clear existing data
    results.cleared.users = await clearCollection('users');
    results.cleared.farmers = await clearCollection('farmers');
    results.cleared.shgs = await clearCollection('shgs');
    results.cleared.listings = await clearCollection('listings');
    results.cleared.products = await clearCollection('products');
    results.cleared.orders = await clearCollection('orders');
    results.cleared.batches = await clearCollection('batches');
    results.cleared.requests = await clearCollection('requests');
    results.cleared.qualityChecks = await clearCollection('qualityChecks');
    results.cleared.payments = await clearCollection('payments');
    results.cleared.priceHistory = await clearCollection('priceHistory');
    
    // Seed all collections
    results.seeded.users = await seedCollection('users', usersData);
    results.seeded.farmers = await seedCollection('farmers', farmersData);
    results.seeded.shgs = await seedCollection('shgs', shgsData);
    results.seeded.listings = await seedCollection('listings', listingsData);
    results.seeded.products = await seedCollection('products', productsData);
    results.seeded.orders = await seedCollection('orders', ordersData);
    results.seeded.batches = await seedCollection('batches', batchesData);
    results.seeded.requests = await seedCollection('requests', requestsData);
    results.seeded.qualityChecks = await seedCollection('qualityChecks', qualityChecksData);
    results.seeded.payments = await seedCollection('payments', paymentsData);
    results.seeded.priceHistory = await seedCollection('priceHistory', priceHistoryData);
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results,
    });
    
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
