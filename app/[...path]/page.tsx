import FilesListingPage from './_components/files-listing-page'
import { ParsedUrlQuery } from 'querystring'

export default async function FilesPage({
                                          params,
                                          searchParams,
                                        }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query: ParsedUrlQuery = {
    ...(await params),
    ...(await searchParams),
  };

  return (
    <FilesListingPage query={query} />
  )
}
