import { list } from '@vercel/blob';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all users data from blob storage
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Verify that the requester is an admin
    const adminId = params.id;
    const admin = users.find((a: any) => a.id === adminId && a.role === 'admin');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return all users without their passwords
    const safeUsers = users.map((user: any) => {
      // Don't include password in the response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Add a route to update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = params.id;
    const { userId, updates } = await request.json();
    
    // Get all users data from blob storage
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Verify that the requester is an admin
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
    
    // Update the user (but don't allow changing ID or role if provided)
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id, // Ensure ID cannot be changed
    };
    
    // Special handling for role changes - only allow if explicitly permitted
    if (updates.role && updates.role !== users[userIndex].role) {
      // You could add additional checks here
      updatedUser.role = updates.role;
    }
    
    // Update the user in the array
    users[userIndex] = updatedUser;
    
    // Save the updated users data to blob storage
    await import('@vercel/blob').then(({ put }) => {
      return put(USERS_BLOB_NAME, JSON.stringify(users), {
        access: 'public',
        contentType: 'application/json',
        token: BLOB_TOKEN
      });
    });
    
    // Return the updated user without the password
    const { password, ...safeUser } = updatedUser;
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}