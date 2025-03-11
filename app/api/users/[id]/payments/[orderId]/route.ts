import { list, put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Blob storage file names
const PAYMENTS_BLOB_NAME = 'payments-data.json';
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

// Helper function to save data to a blob
async function saveBlobData(blobName: string, data: any) {
  try {
    await put(blobName, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });
  } catch (error) {
    console.error(`Error saving blob ${blobName}:`, error);
    throw error;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    // Get payments data from blob
    const payments = await getBlobData(PAYMENTS_BLOB_NAME);
    
    if (!payments) {
      return NextResponse.json({ payment: null }, { status: 404 });
    }
    
    // Find the payment for this order
    const payment = payments.find((p: any) => p.orderId === params.orderId);
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // Verify that the payment belongs to the user
    if (payment.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      );
    }
    
    // Get existing payments
    let payments = await getBlobData(PAYMENTS_BLOB_NAME) || [];
    
    // Create new payment object
    const payment = {
      id: params.orderId,
      orderId: params.orderId,
      userId: params.id,
      amount: parseFloat(body.amount) || 0,
      paymentMethod: body.paymentMethod,
      accountDetails: body.accountDetails || {},
      status: body.status || 'pending',
      createdAt: new Date().toISOString(),
      reference: body.reference || '',
      orderNumber: body.orderNumber || params.orderId.substring(0, 8)
    };
    
    // Check if payment already exists and update it, or add a new one
    const existingIndex = payments.findIndex((p: any) => p.orderId === params.orderId);
    if (existingIndex >= 0) {
      payments[existingIndex] = payment;
    } else {
      payments.push(payment);
    }
    
    // Save updated payments to blob
    await saveBlobData(PAYMENTS_BLOB_NAME, payments);
    
    // Update order status
    try {
      const orders = await getBlobData(ORDERS_BLOB_NAME);
      
      if (orders) {
        const updatedOrders = orders.map((order: any) => {
          if (order.id === params.orderId) {
            return { 
              ...order, 
              status: body.status === 'payé' ? 'processing' : 'pending' 
            };
          }
          return order;
        });
        
        // Save updated orders
        await saveBlobData(ORDERS_BLOB_NAME, updatedOrders);
      }
    } catch (orderError) {
      console.error('Error updating order status:', orderError);
      // Continue execution even if order update fails
    }
    
    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

// Add update payment status endpoint
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const { status, reference } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Get payments data
    const payments = await getBlobData(PAYMENTS_BLOB_NAME);
    
    if (!payments) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Find payment
    const paymentIndex = payments.findIndex((p: any) => 
      p.orderId === params.orderId && p.userId === params.id
    );
    
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Update payment
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      status,
      reference: reference || payments[paymentIndex].reference,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated payments
    await saveBlobData(PAYMENTS_BLOB_NAME, payments);
    
    // Update order status if payment is successful
    if (status === 'payé' || status === 'success' || status === 'completed') {
      try {
        const orders = await getBlobData(ORDERS_BLOB_NAME);
        
        if (orders) {
          const updatedOrders = orders.map((order: any) => {
            if (order.id === params.orderId) {
              return { ...order, status: 'processing' };
            }
            return order;
          });
          
          await saveBlobData(ORDERS_BLOB_NAME, updatedOrders);
        }
      } catch (orderError) {
        console.error('Error updating order status:', orderError);
      }
    }
    
    return NextResponse.json({ payment: payments[paymentIndex] });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}