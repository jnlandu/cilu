import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { NextResponse } from 'next/server'

const ORDERS_CSV_PATH = path.join(process.cwd(), 'data/orders.csv')
const USERS_CSV_PATH = path.join(process.cwd(), 'data/users.csv')

export async function GET() {
  try {
    const [ordersContent, usersContent] = await Promise.all([
      fs.readFile(ORDERS_CSV_PATH, 'utf-8'),
      fs.readFile(USERS_CSV_PATH, 'utf-8')
    ])

    const orders = parse(ordersContent, { columns: true, skip_empty_lines: true })
    const users = parse(usersContent, { columns: true, skip_empty_lines: true })

    const stats = {
      totalOrders: orders.length,
      activeDeliveries: orders.filter((o: any) => o.status === 'processing').length,
      totalCustomers: users.filter((u: any) => u.role === 'user').length,
      totalRevenue: orders.reduce((acc: number, order: any) => acc + parseInt(order.amount || 0), 0)
    }

    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}