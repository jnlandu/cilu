import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  createdAt: string
}

const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json()
     // Validate required fields
     if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }
    
    // Read users from CSV
    const fileContent = await fs.readFile(USERS_CSV_PATH, 'utf-8')
    const users = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const user = users.find((u: any) => 
      u.email === email && u.role === role
    )
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

   // Verify password
   const isValidPassword = await bcrypt.compare(password, user.password)
   if (!isValidPassword) {
     return NextResponse.json(
       { error: 'Mot de passe incorrect' },
       { status: 401 }
     )
   }
    // Remove sensitive data before sending response
    const { password: _, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}