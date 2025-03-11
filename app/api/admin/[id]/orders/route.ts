import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const ORDERS_CSV_PATH = path.join(process.cwd(), 'data/orders.csv')
const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

export async function GET(
   request: NextRequest,
  { params }: { params: { id: string, userId: string } }
)
 {


  try {

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
    
    // Verify that the requester is an admin
    const [ordersContent, usersContent] = await Promise.all([
      fs.readFile(ORDERS_CSV_PATH, 'utf-8'),
      fs.readFile(USERS_CSV_PATH, 'utf-8')
    ])

    const orders = parse(ordersContent, { columns: true, skip_empty_lines: true })
    const users = parse(usersContent, { columns: true, skip_empty_lines: true })

    // Add user names to orders
    const ordersWithUserNames = orders.map((order: any) => {
      const user = users.find((u: any) => u.id === order.userId)
      return {
        ...order,
        userName: user ? user.name : 'Unknown User',
        address: {
          street: user.street || 'Non spécifié',
          city: user.city || 'Non spécifié',
          province: user.province || 'Non spécifié',
          phone: user.phone || 'Non spécifié'
        }
      }
    })
    return NextResponse.json({ orders: ordersWithUserNames })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}