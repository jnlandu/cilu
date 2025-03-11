import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

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