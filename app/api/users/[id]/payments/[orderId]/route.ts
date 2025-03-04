import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import { NextResponse } from 'next/server'

const PAYMENTS_CSV_PATH = path.join(process.cwd(), 'data/payments.csv')
const ORDERS_CSV_PATH = path.join(process.cwd(), 'data/orders.csv')

export async function GET(
  request: Request,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const fileContent = await fs.readFile(PAYMENTS_CSV_PATH, 'utf-8')
    const payments = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const payment = payments.find((p: any) => p.orderId === params.orderId)
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const body = await request.json()

    // Ensure payments CSV exists with ALL necessary columns
    try {
      await fs.access(PAYMENTS_CSV_PATH)
    } catch {
      await fs.writeFile(
        PAYMENTS_CSV_PATH,
        'id,orderId,userId,amount,paymentMethod,accountDetails,status,createdAt,reference,orderNumber\n'
      )
    }

    // Read existing payments
    const fileContent = await fs.readFile(PAYMENTS_CSV_PATH, 'utf-8')
    let payments = []
    
    try {
      payments = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true // Add this to be more tolerant of column mismatches
      })
    } catch (error) {
      console.error('Error parsing CSV file:', error)
      // If parsing fails, start with empty payments array
      payments = []
    }

    const payment = {
      id: params.orderId,
      orderId: params.orderId,
      userId: params.id,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      accountDetails: JSON.stringify(body.accountDetails),
      status: body.status,
      createdAt: new Date().toISOString(),
      reference: body.reference || '',  // Ensure these fields are never undefined
      orderNumber: body.orderNumber || ''
    }

    // Check if payment already exists and update it, or add new one
    const existingIndex = payments.findIndex((p: any) => p.orderId === params.orderId)
    if (existingIndex >= 0) {
      payments[existingIndex] = payment
    } else {
      payments.push(payment)
    }

    // Write updated payments to CSV with explicitly defined columns to ensure consistency
    const columns = [
      'id', 'orderId', 'userId', 'amount', 'paymentMethod', 
      'accountDetails', 'status', 'createdAt', 'reference', 'orderNumber'
    ]
    
    const csv = stringify(payments, { 
      header: true,
      columns: columns
    })
    
    await fs.writeFile(PAYMENTS_CSV_PATH, csv)

    // Update order status
    try {
      const ordersContent = await fs.readFile(ORDERS_CSV_PATH, 'utf-8')
      const orders = parse(ordersContent, {
        columns: true,
        skip_empty_lines: true
      })

      const updatedOrders = orders.map((order: any) => {
        if (order.id === params.orderId) {
          return { ...order, status: body.status === 'payé' ? 'processing' : 'pending' }
        }
        return order
      })

      await fs.writeFile(
        ORDERS_CSV_PATH,
        stringify(updatedOrders, { header: true })
      )
    } catch (orderError) {
      console.error('Error updating order status:', orderError)
      // Continue execution even if order update fails
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}