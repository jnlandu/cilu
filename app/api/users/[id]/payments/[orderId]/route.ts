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

    // Ensure payments CSV exists
    try {
      await fs.access(PAYMENTS_CSV_PATH)
    } catch {
      await fs.writeFile(
        PAYMENTS_CSV_PATH,
        'id,orderId,userId,amount,paymentMethod,accountDetails,status,createdAt\n'
      )
    }

    // Read existing payments
    const fileContent = await fs.readFile(PAYMENTS_CSV_PATH, 'utf-8')
    const payments = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const payment = {
      id: params.orderId,
      orderId: params.orderId,
      userId: params.id,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      accountDetails: JSON.stringify(body.accountDetails),
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    payments.push(payment)

    // Write updated payments to CSV
    const csv = stringify(payments, { header: true })
    await fs.writeFile(PAYMENTS_CSV_PATH, csv)

    // Update order status
    const ordersContent = await fs.readFile(ORDERS_CSV_PATH, 'utf-8')
    const orders = parse(ordersContent, {
      columns: true,
      skip_empty_lines: true
    })

    const updatedOrders = orders.map((order: any) => {
      if (order.id === params.orderId) {
        return { ...order, status: 'processing' }
      }
      return order
    })

    await fs.writeFile(
      ORDERS_CSV_PATH,
      stringify(updatedOrders, { header: true })
    )

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}