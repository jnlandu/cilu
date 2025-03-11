import { list } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  createdAt: string
  street?: string
  city?: string
  province?: string
  phone?: string
  depot?: string
}

// The known URL of your users blob
const USERS_BLOB_NAME = 'users-data.json';
const USERS_BLOB_URL =  "https://ilvvl3kxldn9bxrb.public.blob.vercel-storage.com/users-data-GVCipkQI2tJyU7lajCAhyDXIlDiNf6.json"


// Also keep the blob name and token for future operations
// const USERS_BLOB_NAME = 'users-data.json';
// Fix the variable name to match what you've set in the environment
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }
    
    try {
      // Use the direct URL approach first since we know it
      try {
        // Fetch the users directly from the known URL
        const response = await fetch(USERS_BLOB_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        
        const text = await response.text();
        
        if (text && text.trim()) {
          const users = JSON.parse(text);
          
          // Find user by email and role (if specified)
          const user = users.find((u: User) => 
            u.email === email && (!role || u.role === role)
          );
          
          if (!user) {
            return NextResponse.json(
              { error: 'Email ou mot de passe incorrect' }, // Generic message for security
              { status: 401 }
            );
          }
          
          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return NextResponse.json(
              { error: 'Email ou mot de passe incorrect' }, // Generic message for security
              { status: 401 }
            );
          }
          
          // Remove sensitive data before sending response
          const { password: _, ...safeUser } = user;
          
          return NextResponse.json(safeUser);
        }
      } catch (directUrlError) {
        console.error('Error accessing users blob via direct URL:', directUrlError);
        
        // If direct URL fails, fall back to the list method
        if (BLOB_TOKEN) {
          // Get the list of blobs
          const { blobs } = await list({ token: BLOB_TOKEN });
          
          // Find the users blob
          const userBlob = blobs.find(blob => blob.pathname === USERS_BLOB_NAME);
          
          if (userBlob) {
            // If blob exists, fetch and parse it
            const response = await fetch(userBlob.url);
            const text = await response.text();
            
            if (text && text.trim()) {
              const users = JSON.parse(text);
              
              // Find user by email and role (if specified)
              const user = users.find((u: User) => 
                u.email === email && (!role || u.role === role)
              );
              
              if (!user) {
                return NextResponse.json(
                  { error: 'Email ou mot de passe incorrect' },
                  { status: 401 }
                );
              }
              
              // Verify password
              const isValidPassword = await bcrypt.compare(password, user.password);
              if (!isValidPassword) {
                return NextResponse.json(
                  { error: 'Email ou mot de passe incorrect' },
                  { status: 401 }
                );
              }
              
              // Remove sensitive data before sending response
              const { password: _, ...safeUser } = user;
              
              return NextResponse.json(safeUser);
            }
          }
        }
      }
      
      // If we get here, no matching user was found
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    } catch (error) {
      console.error('Error accessing blob storage:', error);
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}