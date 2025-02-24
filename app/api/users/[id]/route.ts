import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { NextResponse } from 'next/server'

const CSV_FILE_PATH = path.join(process.cwd(), 'data/users.csv')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8')
    const users = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const user = users.find((u: any) => u.id === params.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password, ...safeUser } = user
    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}