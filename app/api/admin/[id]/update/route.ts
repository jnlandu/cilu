import { list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// Blob storage file name
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

interface UpdateUserBody {
  name?: string
  email?: string
  phone?: string
  street?: string
  city?: string
  province?: string
  depot?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, userId: string } }
) {
  try {
    // Verify that the requester is an admin
    const adminId = params.id;
    const userId = params.userId;
    
    // Get users data from blob storage
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Find the admin in the users array
    const admin = users.find((a: any) => a.id === adminId && a.role === 'admin');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user to update
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user data
    const body: UpdateUserBody = await request.json();
    const updatedUser = {
      ...users[userIndex],
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.phone && { phone: body.phone }),
      ...(body.street && { street: body.street }),
      ...(body.city && { city: body.city }),
      ...(body.province && { province: body.province }),
      ...(body.depot && { depot: body.depot }),
    };
    
    users[userIndex] = updatedUser;

    // Write updated users back to blob storage
    await put(USERS_BLOB_NAME, JSON.stringify(users), {
      access: 'public',  // Using private for security
      contentType: 'application/json',
      token: BLOB_TOKEN
    });

    // Return the updated user without sensitive info
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}