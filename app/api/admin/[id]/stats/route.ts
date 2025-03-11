import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Blob storage file names
const ORDERS_BLOB_NAME = 'orders-data.json';
const USERS_BLOB_NAME = 'users-data.json';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Helper function to get blob data
async function getBlobData(blobName: string) {
  try {
    // Get the list of blobs
    const { blobs } = await list({ token: BLOB_TOKEN });
    
    // Find the specific blob
    const blob = blobs.find(b => b.pathname === blobName);
    
    if (!blob) {
      return null;
    }
    
    // Fetch the data
    const response = await fetch(blob.url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status}`);
    }
    
    const text = await response.text();
    
    if (!text || !text.trim()) {
      return null;
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error fetching blob ${blobName}:`, error);
    throw error;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin permissions
    const adminId = params.id;
    
    // Get users data first to verify admin status
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Find the admin user
    const admin = users.find((a: any) => a.id === adminId && a.role === 'admin');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get orders data
    const orders = await getBlobData(ORDERS_BLOB_NAME) || [];
    
    // Calculate stats
    const stats = {
      totalOrders: orders.length,
      activeDeliveries: orders.filter((o: any) => o.status === 'processing').length,
      totalCustomers: users.filter((u: any) => u.role === 'user').length,
      totalRevenue: orders.reduce((acc: number, order: any) => {
        const amount = parseFloat(order.amount) || 0;
        return acc + amount;
      }, 0),
      pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      deliveredOrders: orders.filter((o: any) => o.status === 'delivered').length,
      // Additional stats you might want to include
      averageOrderValue: orders.length > 0 
        ? orders.reduce((acc: number, order: any) => acc + (parseFloat(order.amount) || 0), 0) / orders.length
        : 0,
      // Last 7 days stats
      recentOrders: orders.filter((o: any) => {
        const orderDate = new Date(o.date || o.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }).length
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}