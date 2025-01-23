import { NextResponse } from 'next/server'
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export interface ApiError {
  code: string
  message: string
  status: number
}

export function handleDatabaseError(error: unknown): NextResponse {
  console.error('Database error:', error)

  // Handle specific Prisma errors
  if (error instanceof PrismaClientInitializationError) {
    return NextResponse.json(
      {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Unable to connect to the database. Please try again later.',
        status: 503
      } as ApiError,
      { status: 503 }
    )
  }

  if (error instanceof PrismaClientKnownRequestError) {
    return NextResponse.json(
      {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed. Please try again later.',
        status: 500
      } as ApiError,
      { status: 500 }
    )
  }

  // Generic error
  return NextResponse.json(
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      status: 500
    } as ApiError,
    { status: 500 }
  )
}
