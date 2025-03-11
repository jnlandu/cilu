import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

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

interface CreateUserBody {
  name: string
  email: string
  password: string
  phone: string
  street: string
  city: string
  province: string
  depot: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    // Verify that the requester is an admin
    const admin = users.find((a: any) => a.id === adminId && a.role === 'admin');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from request
    const body: CreateUserBody = await request.json();

    // Check if email already exists
    const existingUser = users.find((u: any) => u.email === body.email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone || '',
      street: body.street || '',
      city: body.city || '',
      province: body.province || '',
      depot: body.depot || '',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Add user to list
    users.push(newUser);

    // Save the updated users list to blob storage
    await put(USERS_BLOB_NAME, JSON.stringify(users), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}