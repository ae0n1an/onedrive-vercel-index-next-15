import type { OdThumbnail } from '../../../types'

import { posix as pathPosix } from 'path'

import axios from 'axios'

import { checkAuthRoute, encodePath, getAccessToken } from '../route'
import apiConfig from '../../../config/api.config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token.' }, { status: 403 })
  }

  // Get item thumbnails by its path since we will later check if it is protected
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''
  const size = searchParams.get('size') ?? 'medium'
  const odpt = searchParams.get('odpt') ?? ''

  const headers = new Headers()

  // Set edge function caching for faster load times, if route is not protected, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  if (odpt === '') {
    headers.set('Cache-Control', apiConfig.cacheControlHeader)
  }

  // Check whether the size is valid - must be one of 'large', 'medium', or 'small'
  if (size !== 'large' && size !== 'medium' && size !== 'small') {
    return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
  }

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return NextResponse.json({ error: 'No path specified.' }, { status: 400 })
  }

  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return NextResponse.json({ error: 'Path query invalid.' }, { status: 400 })
  }

  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odpt as string)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return NextResponse.json({ error: message }, { status: code, headers })
  }

  // If message is empty, then the path is not protected.
  // Conversely, protected routes are not allowed to serve from cache.
  if (message !== '') {
    headers.set('Cache-Control', 'no-cache')
  }

  const requestPath = encodePath(cleanPath)
  // Handle response from OneDrive API
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
  const isRoot = requestPath === ''

  try {
    const { data } = await axios.get(`${requestUrl}${isRoot ? '' : ':'}/thumbnails`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const thumbnailUrl = data.value && data.value.length > 0 ? (data.value[0] as OdThumbnail)[size].url : null
    if (thumbnailUrl) {
      return NextResponse.redirect(thumbnailUrl, {headers})
    } else {
      return NextResponse.json({ error: "The item doesn't have a valid thumbnail." }, { status: 400})
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data ?? 'Internal server error.' },
      { status: error?.response?.status ?? 500 }
    )
  }
}
