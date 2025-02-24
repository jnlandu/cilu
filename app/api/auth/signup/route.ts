import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const CSV_FILE_PATH = path.join(process.cwd(), 'data/users.csv')

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Read existing users
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8')
    const users = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Check if user already exists
    if (users.some((user: any) => user.email === email)) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    // Add user to CSV
    users.push(newUser)
    const csv = stringify(users, { 
      header: true,
      columns: ['id', 'name', 'email', 'password', 'role', 'createdAt']
    })
    await fs.writeFile(CSV_FILE_PATH, csv)

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}