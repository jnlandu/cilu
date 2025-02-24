import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

interface User {
  email: string;
  password: string;
  name: string;
}

const CSV_FILE_PATH = path.join(process.cwd(), 'data/users.csv')

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8')
    const records: User[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const user = records.find(user => user.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}