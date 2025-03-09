// app/oauth/step-3/page.js
import { requestTokenWithAuthCode } from '../../../old/utils/oAuthHandler'
import StepThreePage from './_components/step-three-page'

export default async function OAuthStep3({
                                           params,
                                           searchParams,
                                         }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
})  {
  const { authCode } = await searchParams

  if (!authCode || typeof authCode !== "string") {
    return (
      <StepThreePage accessToken={null} refreshToken={null} expiryTime={null} error={'No auth code present'} description={'Where is the auth code? Did you follow step 2 you silly donut?'} errorUri={null} />
    )
  }

  const response = await requestTokenWithAuthCode(authCode)

  // If error response, return invalid
  if ('error' in response) {
    return (
      <StepThreePage accessToken={null} refreshToken={null} expiryTime={null} error={response.error} description={response.errorDescription} errorUri={response.errorUri} />
    )
  }

  return (
    <StepThreePage accessToken={response.accessToken} expiryTime={parseInt(response.expiryTime)} refreshToken={response.refreshToken} error={null} errorUri={null} description={''}/>
  )
}
