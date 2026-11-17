'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()} `}</span>
        <span className='font-semibold text-primary'>Kanopi Kita</span>
        <span className='text-textSecondary'> — Platform Konservasi, Adopsi & Pemantauan Karbon Hutan Indonesia</span>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4 text-sm text-textSecondary'>
          <span>PRD v2.0 Baseline</span>
          <span>•</span>
          <span>Admin & Area Owner Backoffice</span>
        </div>
      )}
    </div>
  )
}

export default FooterContent
