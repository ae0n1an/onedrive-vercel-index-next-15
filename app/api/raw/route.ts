import { posix as pathPosix } from 'path'

import axios from 'axios'

import { driveApi, cacheControlHeader } from '../../../config/api.config'
import { encodePath, getAccessToken, checkAuthRoute } from '../route'
import { NextRequest, NextResponse } from 'next/server'

const allowedOrigins = ['http://localhost:3000', 'https://mozilla.github.io'];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function runCorsMiddleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }

  // Handle simple requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  console.log(response);

  return response
}

// CORS middleware for raw links: https://nextjs.org/docs/api-routes/api-middlewares
// export function runCorsMiddleware(req: NextRequest) {
//   const cors = Cors({ methods: ['GET', 'HEAD'] })
//   return new Promise((resolve, reject) => {
//     const response = NextResponse.next(); // This is a blank response to continue the chain
//     cors(req as any, response, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result)
//       }
//
//       return resolve(result)
//     })
//   })
// }

export const GET = async (req: NextRequest) => {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token.' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const path = searchParams.get('path') || '/'
  const odpt = searchParams.get('odpt') || ''
  const proxy = searchParams.get('proxy') === 'true'

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return NextResponse.json({ error: 'No path specified.' }, { status: 400 })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return NextResponse.json({ error: 'Path query invalid.' }, { status: 400 })
  }
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  // Handle protected routes authentication
  const odTokenHeader = (req.headers['od-protected-token'] as string) ?? odpt

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return NextResponse.json({ error: message }, { status: code })
  }

  // If message is empty, then the path is not protected.
  // Conversely, protected routes are not allowed to serve from cache.
  // if (message !== '') {
  //   response.headers.set('Cache-Control', 'no-cache')
  // }

  await runCorsMiddleware(req)
  try {
    // Handle response from OneDrive API
    const requestUrl = `${driveApi}/root${encodePath(cleanPath)}`
    const { data } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
        select: 'id,size,@microsoft.graph.downloadUrl',
      },
    })

    if ('@microsoft.graph.downloadUrl' in data) {
      // Only proxy raw file content response for files up to 4MB
      if (proxy && 'size' in data && data['size'] < 4194304) {
        const { headers, data: stream } = await axios.get(data['@microsoft.graph.downloadUrl'] as string, {
          responseType: 'stream',
        })

        // Create response with stream data
        const response = new NextResponse(stream, { status: 200 })

        // Set headers from OneDrive response
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, String(value))
        })

        // Ensure Cache-Control is set
        response.headers.set('Cache-Control', cacheControlHeader)

        return response
      } else {
        const response = NextResponse.redirect(data['@microsoft.graph.downloadUrl']);

        response.headers.set('Access-Control-Allow-Origin', 'https://mozilla.github.io')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

        return response
      }
    } else {
      return NextResponse.json({ error: 'No download URL found.' }, { status: 404 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data ?? 'Internal server error.' },
      { status: error?.response?.status ?? 500 }
    )
  }
}
