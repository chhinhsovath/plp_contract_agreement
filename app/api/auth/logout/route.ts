import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    message: 'ចាកចេញបានជោគជ័យ',
  })

  // Clear the auth cookie
  response.cookies.delete('auth-token')

  return response
}