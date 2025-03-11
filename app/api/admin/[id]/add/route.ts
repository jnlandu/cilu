import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

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
    const adminId = params.id
    const adminContent = await fs.readFile(USERS_CSV_PATH, 'utf-8')
    const admins = parse(adminContent, {
      columns: true,
      skip_empty_lines: true
    })
    
    const admin = admins.find((a: any) => a.id === adminId && a.role === 'admin')
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users
    const users = parse(adminContent, {
      columns: true,
      skip_empty_lines: true
    }).map((user: any) => {
      // Don't include password in the response
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify that the requester is an admin
    const adminId = params.id
    const usersContent = await fs.readFile(USERS_CSV_PATH, 'utf-8')
    const users = parse(usersContent, {
      columns: true,
      skip_empty_lines: true
    })
    
    const admin = users.find((a: any) => a.id === adminId && a.role === 'admin')
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from request
    const body: CreateUserBody = await request.json()

    // Check if email already exists
    const existingUser = users.find((u: any) => u.email === body.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(body.password, salt)

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone,
      street: body.street,
      city: body.city,
      province: body.province,
      depot: body.depot,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    // Add user to list
    users.push(newUser)

    // Write updated list back to file
    const csv = stringify(users, { header: true })
    await fs.writeFile(USERS_CSV_PATH, csv)

    // Return user without password
    const { password, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}