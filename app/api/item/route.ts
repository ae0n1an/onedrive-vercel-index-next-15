import axios from 'axios'
import { getAccessToken } from '../route'
import apiConfig from '../../../config/api.config'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Get item ID from request parameters
  const id = req.nextUrl.searchParams.get('id')

  let responseData
  let statusCode = 200

  if (!id) {
    responseData = { error: 'Invalid driveItem ID.' }
    statusCode = 400
  } else {
    const itemApi = `${apiConfig.driveApi}/items/${id}`
    try {
      const { data } = await axios.get(itemApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { select: 'id,name,parentReference' },
      })
      responseData = data
    } catch (error: any) {
      responseData = { error: error?.response?.data ?? 'Internal server error.' }
      statusCode = error?.response?.status ?? 500
    }
  }

  // Create response once and set headers
  const response = NextResponse.json(responseData, { status: statusCode })
  response.headers.set('Cache-Control', apiConfig.cacheControlHeader)

  return response
}
