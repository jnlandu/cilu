import { list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Blob storage file name
const ORDERS_BLOB_NAME = 'orders-data.json';
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
  { params }: { params: { id: string } }
) {
  try {
    // Get orders data from blob storage
    const orders = await getBlobData(ORDERS_BLOB_NAME);
    
    // If no orders blob exists yet or it's empty, return empty array
    if (!orders) {
      return NextResponse.json({ orders: [] });
    }
    
    // Filter orders for this user
    const userOrders = orders.filter((order: any) => order.userId === params.id);
    
    // Ensure quantity is a number and return
    return NextResponse.json({
      orders: userOrders.map((order: any) => ({
        ...order,
        quantity: parseInt(order.quantity, 10) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { product, quantity } = await request.json();
    
    // Validate input
    if (!product || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get existing orders from blob storage
    let orders = await getBlobData(ORDERS_BLOB_NAME) || [];
    
    // Create new order
    const newOrder = {
      id: uuidv4(),
      userId: userId,
      product,
      quantity: parseInt(quantity, 10) || 0,
      amount: 0, // You might want to calculate this based on product
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    // Add new order to array
    orders.push(newOrder);
    
    // Save updated orders to blob storage
    await put(ORDERS_BLOB_NAME, JSON.stringify(orders), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });
    
    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Add a method to update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { orderId, status, quantity } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Get existing orders
    const orders = await getBlobData(ORDERS_BLOB_NAME);
    
    if (!orders) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Find the order and verify it belongs to the user
    const orderIndex = orders.findIndex((o: any) => 
      o.id === orderId && o.userId === userId
    );
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found or not authorized' },
        { status: 404 }
      );
    }
    
    // Update the order
    if (status) orders[orderIndex].status = status;
    if (quantity) orders[orderIndex].quantity = parseInt(quantity, 10);
    
    // Save updated orders
    await put(ORDERS_BLOB_NAME, JSON.stringify(orders), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });
    
    return NextResponse.json({ order: orders[orderIndex] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Add a method to delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Get existing orders
    const orders = await getBlobData(ORDERS_BLOB_NAME);
    
    if (!orders) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Find the order and verify it belongs to the user
    const orderIndex = orders.findIndex((o: any) => 
      o.id === orderId && o.userId === userId
    );
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found or not authorized' },
        { status: 404 }
      );
    }
    
    // Remove the order
    const deletedOrder = orders.splice(orderIndex, 1)[0];
    
    // Save updated orders
    await put(ORDERS_BLOB_NAME, JSON.stringify(orders), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });
    
    return NextResponse.json({ 
      message: 'Order deleted successfully',
      order: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}