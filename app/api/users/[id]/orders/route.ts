import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'
import { NextResponse } from 'next/server'



import { stringify } from 'csv-stringify/sync'
import { v4 as uuidv4 } from 'uuid'

const ORDERS_CSV_PATH = path.join(process.cwd(), 'data/orders.csv')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if file exists, if not create it with headers
    try {
      await fs.access(ORDERS_CSV_PATH)
    } catch {
      await fs.writeFile(ORDERS_CSV_PATH, 'id,userId,product,quantity,status,date\n')
    }

    const fileContent = await fs.readFile(ORDERS_CSV_PATH, 'utf-8')
    const orders = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const userOrders = orders.filter((order: any) => order.userId === params.id)
    
    return NextResponse.json({
      orders: userOrders.map((order: any) => ({
        ...order,
        quantity: parseInt(order.quantity, 10)
      }))
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { product, quantity } = await request.json()

    // Validate input
    if (!product || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Read existing orders
    let orders = []
    try {
      const fileContent = await fs.readFile(ORDERS_CSV_PATH, 'utf-8')
      orders = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      })
    } catch (error) {
      // File doesn't exist, create it with headers
      await fs.writeFile(
        ORDERS_CSV_PATH,
        'id,userId,product,quantity,status,date\n'
      )
    }

    // Create new order
    const newOrder = {
      id: uuidv4(),
      userId: "current-user-id", // Replace with actual user ID from auth
      product,
      quantity,
      status: 'pending',
      date: new Date().toISOString()
    }

    orders.push(newOrder)

    // Write back to CSV
    const csv = stringify(orders, { header: true })
    await fs.writeFile(ORDERS_CSV_PATH, csv)

    return NextResponse.json({ order: newOrder })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}