"use client";
import '@fortawesome/fontawesome-svg-core/styles.css'

import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'

config.autoAddCss = false

library.add(fab)
library.add(far)
library.add(fas)

export default function ClientLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
<>
    {children}
</>
  )
}
