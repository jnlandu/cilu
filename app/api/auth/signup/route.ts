import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import path from 'path'

const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

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
    const body = await request.json()
    const { name, email, password, street, city, province, depot, phone } = body

    // Ensure users CSV exists
    try {
      await fs.access(USERS_CSV_PATH)
    } catch {
      // Create users.csv with headers if it doesn't exist
      await fs.writeFile(
        USERS_CSV_PATH,
        'id,name,email,password,role,createdAt,street,city,province,phone,depot\n'
      )
    }

    // Read existing users
    const fileContent = await fs.readFile(USERS_CSV_PATH, 'utf-8')
    let users = []
    
    try {
      users = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
      })
    } catch (error) {
      console.error('Error parsing users CSV file:', error)
      users = []
    }

    // Check if email already exists
    const existingUser = users.find((u: any) => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

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
    }

    users.push(newUser)

    // Write updated users to CSV
    const columns = [
      'id', 'name', 'email', 'password', 'role', 'createdAt',
      'street', 'city', 'province', 'phone', 'depot'
    ]
    
    const csv = stringify(users, { 
      header: true,
      columns: columns
    })
    
    await fs.writeFile(USERS_CSV_PATH, csv)

    // Return success without the password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error in signup:', error)
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    )
  }
}