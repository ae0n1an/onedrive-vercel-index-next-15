"use client";

import FourOhFour from '../four-oh-four'
import Loading from '../loading'
import DownloadButtonGroup from '../download-btn-gtoup'
import useFileContent from '../../utils/fetchOnMount'
import { DownloadBtnContainer, PreviewContainer } from './containers'
import { usePathname } from 'next/navigation'

const TextPreview = ({ file }) => {
  // const { asPath } = useRouter()
  const pathname = usePathname()
  const asPath = decodeURIComponent(pathname)

  const { response: content, error, validating } = useFileContent(`/api/raw/?path=${asPath}`, pathname)
  if (error) {
    return (
      <PreviewContainer>
        <FourOhFour errorMsg={error} />
      </PreviewContainer>
    )
  }

  if (validating) {
    return (
      <>
        <PreviewContainer>
          <Loading loadingText={'Loading file content...'} />
        </PreviewContainer>
        <DownloadBtnContainer>
          <DownloadButtonGroup />
        </DownloadBtnContainer>
      </>
    )
  }

  if (!content) {
    return (
      <>
        <PreviewContainer>
          <FourOhFour errorMsg={'File is empty.'} />
        </PreviewContainer>
        <DownloadBtnContainer>
          <DownloadButtonGroup />
        </DownloadBtnContainer>
      </>
    )
  }

  return (
    <div>
      <PreviewContainer>
        <pre className="overflow-x-scroll p-0 text-sm md:p-3">{content}</pre>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default TextPreview
