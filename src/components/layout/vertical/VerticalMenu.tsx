// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

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
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
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
          <MenuItem
            href='/surveys'
            icon={<i className='ri-file-list-3-line' />}
            suffix={<Chip label='2' size='small' sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />}
          >
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
          <MenuItem
            href='/incidents'
            icon={<i className='ri-alarm-warning-line' />}
            suffix={<Chip label='2' size='small' sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 700 }} />}
          >
            Triage Insiden Pohon
          </MenuItem>
          <MenuItem href='/calendar' icon={<i className='ri-calendar-line' />}>
            Jadwal Monitoring
          </MenuItem>
          <MenuItem href='/users' icon={<i className='ri-user-settings-line' />}>
            Pengguna & RBAC
          </MenuItem>
        </MenuSection>

        <MenuSection label='MASTER DATA & SKEMA'>
          <MenuItem href='/master/species' icon={<i className='ri-seedling-line' />}>
            Master Spesies Pohon
          </MenuItem>
          <MenuItem href='/master/form-templates' icon={<i className='ri-survey-line' />}>
            Template Form Survei
          </MenuItem>
          <MenuItem href='/master/organizations' icon={<i className='ri-building-2-line' />}>
            Organisasi & Mitra
          </MenuItem>
        </MenuSection>

        <MenuSection label='PENGATURAN & KREDENSIAL'>
          <MenuItem href='/settings/account' icon={<i className='ri-shield-user-line' />}>
            Kelola Akun & Profil
          </MenuItem>
          <MenuItem href='/settings/system' icon={<i className='ri-key-2-line' />}>
            Kredensial Map & Sistem
          </MenuItem>
          <MenuItem href='/login' icon={<i className='ri-login-box-line' />}>
            Ganti Sesi Login
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
