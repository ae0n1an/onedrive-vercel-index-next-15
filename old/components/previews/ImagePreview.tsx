"use client";
import type { OdFileObject } from '../../types'

import { FC } from 'react'
import { usePathname } from 'next/navigation'

import { PreviewContainer, DownloadBtnContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { getStoredToken } from '../../utils/protectedRouteHandler'

const ImagePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  // const { asPath } = useRouter()
  const pathname = usePathname()
  const asPath = decodeURIComponent(pathname)

  const hashedToken = getStoredToken(pathname)

  return (
    <>
      <PreviewContainer>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mx-auto"
          src={`/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`}
          alt={file.name}
          width={file.image?.width}
          height={file.image?.height}
        />
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </>
  )
}

export default ImagePreview
