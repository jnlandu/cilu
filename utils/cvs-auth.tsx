import { promises as fs } from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'
import bcrypt from 'bcryptjs'

interface User {
  email: string;
  password: string;
  name: string;
}

const CSV_FILE_PATH = path.join(process.cwd(), 'data/users.csv')

export async function verifyUser(email: string, password: string): Promise<User | null> {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8')
    const records: User[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const user = records.find(user => user.email === email)
    if (!user) return null

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return null

    return user
  } catch (error) {
    console.error('Error verifying user:', error)
    return null
  }
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User | null> {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8')
    const records: User[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Check if user already exists
    if (records.some(user => user.email === userData.email)) {
      return null
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const newUser = {
      ...userData,
      password: hashedPassword
    }

    records.push(newUser)

    // Write back to CSV
    const csv = stringify(records, { header: true })
    await fs.writeFile(CSV_FILE_PATH, csv)

    return newUser
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}