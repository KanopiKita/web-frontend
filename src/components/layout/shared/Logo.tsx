'use client'

// React Imports
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// Third-party Imports
import styled from '@emotion/styled'

// Type Imports
import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
  isBreakpointReached?: VerticalNavContextProps['isBreakpointReached']
  color?: CSSProperties['color']
}

const LogoTextContainer = styled.div<LogoTextProps>`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0; width: 0; overflow: hidden;'
      : 'opacity: 1; margin-inline-start: 10px;'}
`

const KanopiForestIcon = () => (
  <div
    style={{
      width: 34,
      height: 34,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #176B4D 0%, #104D39 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(23, 107, 77, 0.25)',
      flexShrink: 0
    }}
  >
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 2L5 11H8.5L4.5 17H10.5V22H13.5V17H19.5L15.5 11H19L12 2Z'
        fill='#C8E66A'
      />
    </svg>
  </div>
)

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  const logoTextRef = useRef<HTMLDivElement>(null)
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
  }, [isHovered, layout, isBreakpointReached])

  return (
    <div className='flex items-center min-bs-[34px]'>
      <KanopiForestIcon />
      <LogoTextContainer
        color={color}
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: color ?? '#17251E', letterSpacing: '-0.2px' }}>
          {themeConfig.templateName}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#176B4D', letterSpacing: '0.06em' }}>
          BACKOFFICE v2.0
        </span>
      </LogoTextContainer>
    </div>
  )
}

export default Logo
