import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

interface UpdateUserBody {
  name?: string
  email?: string
  phone?: string
  street?: string
  city?: string
  province?: string
  depot?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, userId: string } }
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

    // Find the user to update
    const userIndex = users.findIndex((u: any) => u.id === params.userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user data
    const body: UpdateUserBody = await request.json()
    const updatedUser = {
      ...users[userIndex],
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.phone && { phone: body.phone }),
      ...(body.street && { street: body.street }),
      ...(body.city && { city: body.city }),
      ...(body.province && { province: body.province }),
      ...(body.depot && { depot: body.depot }),
    }
    
    users[userIndex] = updatedUser

    // Write updated users back to file
    const csv = stringify(users, { header: true })
    await fs.writeFile(USERS_CSV_PATH, csv)

    // Return the updated user without sensitive info
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}