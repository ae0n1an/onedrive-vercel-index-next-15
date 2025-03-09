"use client";

import Navbar from '../../../old/components/Navbar'
import FileListing from '../../../old/components/FileListing'
import Footer from '../../../old/components/Footer'
import Breadcrumb from '../../../old/components/Breadcrumb'
import SwitchLayout from '../../../old/components/SwitchLayout'
import { ParsedUrlQuery } from 'querystring'

export default function FilesListingPage({query}:{query?: ParsedUrlQuery}) {
  console.log(query)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />
        <div className="mx-auto w-full max-w-5xl py-4 sm:p-4">
          <nav className="mb-4 flex items-center justify-between space-x-3 px-4 sm:px-0 sm:pl-1">
            <Breadcrumb query={query} />
            <SwitchLayout />
          </nav>
          <FileListing query={query}/>
        </div>
      </main>

      <Footer />
    </div>
  )
}
