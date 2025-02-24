import { promises as fs } from 'fs'
import { parse} from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

const CSV_FILE_PATH = path.join(process.cwd(), 'data/users.csv')

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    if (records.some((user: any) => user.email === userData.email)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const newUser = {
      ...userData,
      password: hashedPassword
    }

    records.push(newUser)
    const csv = stringify(records, { header: true })
    await fs.writeFile(CSV_FILE_PATH, csv)

    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}