"use client";
import { FC } from 'react'
import useSystemTheme from 'react-use-system-theme'

import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNightEighties, tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

import useFileContent from '../../utils/fetchOnMount'
import { getLanguageByFileName } from '../../utils/getPreviewType'
import FourOhFour from '../four-oh-four'
import Loading from '../loading'
import DownloadButtonGroup from '../download-btn-gtoup'
import { DownloadBtnContainer, PreviewContainer } from './containers'
import { usePathname } from 'next/navigation'

const CodePreview: FC<{ file: any }> = ({ file }) => {
  // const { asPath } = useRouter()
  const pathname = usePathname();
  const asPath = decodeURIComponent(pathname)

  const { response: content, error, validating } = useFileContent(`/api/raw/?path=${asPath}`, asPath)

  const theme = useSystemTheme('dark')

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

  return (
    <>
      <PreviewContainer>
        <SyntaxHighlighter
          language={getLanguageByFileName(file.name)}
          style={theme === 'dark' ? tomorrowNightEighties : tomorrow}
        >
          {content}
        </SyntaxHighlighter>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </>
  )
}

export default CodePreview
