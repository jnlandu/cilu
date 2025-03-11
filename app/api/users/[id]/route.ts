import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get users data from blob storage
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Find the requested user
    const user = users.find((u: any) => u.id === params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove sensitive data
    const { password, ...safeUser } = user;
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add PATCH endpoint to update user data
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    
    // Get users data from blob storage
    const users = await getBlobData(USERS_BLOB_NAME);
    
    if (!users) {
      return NextResponse.json(
        { error: 'Users data not found' },
        { status: 404 }
      );
    }
    
    // Find user index
    const userIndex = users.findIndex((u: any) => u.id === id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent updates to critical fields
    const { password: newPassword, id: newId, role, ...allowedUpdates } = updates;
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...allowedUpdates,
      // Don't change these critical fields
      id: users[userIndex].id,
      role: users[userIndex].role
    };
    
    // Update password if provided
    if (newPassword) {
      // For password changes, you should implement proper hashing here
      // Example: users[userIndex].password = await bcrypt.hash(newPassword, 10);
      
      // For now, let's just note that password should be changed properly
      console.warn('Password update attempted but proper hashing not implemented');
    }
    
    // Save updated users
    await import('@vercel/blob').then(({ put }) => {
      return put(USERS_BLOB_NAME, JSON.stringify(users), {
        access: 'public',
        contentType: 'application/json',
        token: BLOB_TOKEN
      });
    });
    
    // Return updated user without password
    const { password, ...safeUser } = users[userIndex];
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}