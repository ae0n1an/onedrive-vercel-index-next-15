import { GET as raw_Get } from '../../raw/route'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return raw_Get(req)
}
