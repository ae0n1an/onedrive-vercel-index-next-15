"use client";
import type { OdFileObject } from '../../types'
import { FC, useEffect, useRef, useState } from 'react'

import Preview from 'preview-office-docs'

import DownloadButtonGroup from '../download-btn-gtoup'
import { DownloadBtnContainer } from './containers'
import { getBaseUrl } from '../../utils/getBaseUrl'
import { getStoredToken } from '../../utils/protectedRouteHandler'
import { usePathname } from 'next/navigation'

const OfficePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  // const { asPath } = useRouter()
  const pathname = usePathname()
  const asPath = decodeURIComponent(pathname)

  const hashedToken = getStoredToken(asPath)

  const docContainer = useRef<HTMLDivElement>(null)
  const [docContainerWidth, setDocContainerWidth] = useState(600)

  const docUrl = encodeURIComponent(
    `${getBaseUrl()}/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`
  )

  console.log(docUrl)

  useEffect(() => {
    setDocContainerWidth(docContainer.current ? docContainer.current.offsetWidth : 600)
  }, [])

  return (
    <div>
      <div className="overflow-scroll" ref={docContainer} style={{ maxHeight: '90vh' }}>
        <Preview url={docUrl} width={docContainerWidth.toString()} height="600" />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview
