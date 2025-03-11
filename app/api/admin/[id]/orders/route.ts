import { put,list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

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
  request: NextRequest,
  { params }: { params: { id: string, userId: string } }
) {
  try {
    // Verify that the requester is an admin
    const adminId = params.id;
    
    // Get users data from blob storage
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
    
    // Get orders data from blob storage
    const orders = await getBlobData(ORDERS_BLOB_NAME);
    
    if (!orders) {
      // Return empty array if no orders exist yet
      return NextResponse.json({ orders: [] });
    }
    
    // Add user names and address info to orders
    const ordersWithUserNames = orders.map((order: any) => {
      const user = users.find((u: any) => u.id === order.userId);
      
      return {
        ...order,
        userName: user ? user.name : 'Unknown User',
        address: {
          street: user?.street || 'Non spécifié',
          city: user?.city || 'Non spécifié',
          province: user?.province || 'Non spécifié',
          phone: user?.phone || 'Non spécifié'
        }
      };
    });
    
    return NextResponse.json({ orders: ordersWithUserNames });
    
  } catch (error) {
    console.error('Error in admin orders route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Add order creation endpoint for admins
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = params.id;
    
    // Get users data from blob storage
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Verify admin permissions
    const admin = users.find((a: any) => a.id === adminId && a.role === 'admin');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get order data from request
    const orderData = await request.json();
    
    // Validate order data
    if (!orderData.userId || !orderData.product || !orderData.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get existing orders
    const orders = await getBlobData(ORDERS_BLOB_NAME) || [];
    
    // Create new order
    const newOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: orderData.userId,
      product: orderData.product,
      quantity: parseInt(orderData.quantity) || 0,
      amount: parseFloat(orderData.amount) || 0,
      status: orderData.status || 'pending',
      date: orderData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    // Add new order to array
    orders.push(newOrder);
    
    // Save updated orders
    await put(ORDERS_BLOB_NAME, JSON.stringify(orders), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });
    
    // Find user details to include in response
    const user = users.find((u: any) => u.id === newOrder.userId);
    
    // Return the new order with user details
    const orderWithUserName = {
      ...newOrder,
      userName: user ? user.name : 'Unknown User',
      address: {
        street: user?.street || 'Non spécifié',
        city: user?.city || 'Non spécifié',
        province: user?.province || 'Non spécifié',
        phone: user?.phone || 'Non spécifié'
      }
    };
    
    return NextResponse.json(
      { order: orderWithUserName },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}