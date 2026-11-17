// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='ri-dashboard-line' />}>
          Dashboard Ringkasan
        </MenuItem>

        <MenuSection label='KONSERVASI & SPASIAL'>
          <MenuItem href='/areas' icon={<i className='ri-map-2-line' />}>
            Kawasan & WebGIS
          </MenuItem>
          <MenuItem href='/trees' icon={<i className='ri-plant-line' />}>
            Inventaris & Review Pohon
          </MenuItem>
          <MenuItem href='/surveys' icon={<i className='ri-file-list-3-line' />}>
            Hasil Survei Lapangan
          </MenuItem>
        </MenuSection>

        <MenuSection label='ADOPSI & TRANSAKSI'>
          <MenuItem href='/adoptions' icon={<i className='ri-hand-heart-line' />}>
            Adopsi & Invoice
          </MenuItem>
          <MenuItem href='/carbon-certificates' icon={<i className='ri-award-line' />}>
            Sertifikat & Karbon
          </MenuItem>
        </MenuSection>

        <MenuSection label='OPERASIONAL & TIM'>
          <MenuItem href='/incidents' icon={<i className='ri-alarm-warning-line' />}>
            Triage Insiden Pohon
          </MenuItem>
          <MenuItem href='/calendar' icon={<i className='ri-calendar-line' />}>
            Jadwal Monitoring
          </MenuItem>
          <MenuItem href='/users' icon={<i className='ri-user-settings-line' />}>
            Pengguna & Organisasi
          </MenuItem>
        </MenuSection>

        <MenuSection label='AUTENTIKASI & AKUN'>
          <MenuItem href='/login' target='_blank' icon={<i className='ri-login-box-line' />}>
            Halaman Masuk (Login)
          </MenuItem>
          <MenuItem href='/register' target='_blank' icon={<i className='ri-user-add-line' />}>
            Daftar Akun Baru (Register)
          </MenuItem>
        </MenuSection>
      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
