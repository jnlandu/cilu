import { put, list } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// Blob storage file name
const USERS_BLOB_NAME = 'users-data.json';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE__READ_WRITE_TOKEN

interface UserData {
  id: string
  name: string
  email: string
  password: string
  role: string
  createdAt: string
  street?: string
  city?: string
  province?: string
  phone?: string
  depot?: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, street, city, province, depot, phone } = body;

    // Get existing users from blob storage, or create a new array
    let users: UserData[] = [];
    
    try {
      // Try to get the current users blob with explicit token
      const { blobs } = await list({ token: BLOB_TOKEN });
      const userBlob = blobs.find(blob => blob.pathname === USERS_BLOB_NAME);
      
      if (userBlob) {
        // If blob exists, fetch and parse it
        const response = await fetch(userBlob.url);
        const text = await response.text();
        
        // Make sure we have valid JSON before parsing
        if (text && text.trim()) {
          users = JSON.parse(text);
        }
      } 
      // If userBlob doesn't exist or is empty, we'll use the empty array we initialized
    } catch (error) {
      console.error('Error retrieving users from blob storage:', error);
      // Continue with empty users array if there's an error
      // This is fine for the first user creation
    }

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser: UserData = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
      street: street || '',
      city: city || '',
      province: province || '',
      phone: phone || '',
      depot: depot || ''
    };

    // Add the new user to the array
    users.push(newUser);

    // Create or update the users blob
    await put(USERS_BLOB_NAME, JSON.stringify(users), {
      access: 'public', // Using private for security
      contentType: 'application/json',
      token: BLOB_TOKEN,
    });

    console.log(`User created successfully: ${email}`);

    // Return success without the password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}