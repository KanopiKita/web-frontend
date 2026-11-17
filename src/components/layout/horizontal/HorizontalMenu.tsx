// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = () => {
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { transitionDuration } = verticalNavOptions

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuItemStyles={menuItemStyles(theme, 'ri-circle-fill')}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 4 : 14),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='ri-circle-fill' /> }
        }}
      >
        <MenuItem href='/dashboard' icon={<i className='ri-dashboard-line' />}>
          Dashboard
        </MenuItem>
        <MenuItem href='/areas' icon={<i className='ri-map-2-line' />}>
          Kawasan & WebGIS
        </MenuItem>
        <MenuItem href='/trees' icon={<i className='ri-plant-line' />}>
          Inventaris Pohon
        </MenuItem>
        <MenuItem href='/surveys' icon={<i className='ri-file-list-3-line' />}>
          Survei Lapangan
        </MenuItem>
        <MenuItem href='/adoptions' icon={<i className='ri-hand-heart-line' />}>
          Adopsi & Invoice
        </MenuItem>
        <MenuItem href='/carbon-certificates' icon={<i className='ri-award-line' />}>
          Sertifikat Karbon
        </MenuItem>
        <MenuItem href='/incidents' icon={<i className='ri-alarm-warning-line' />}>
          Triage Insiden
        </MenuItem>
        <MenuItem href='/calendar' icon={<i className='ri-calendar-line' />}>
          Jadwal Monitoring
        </MenuItem>
        <MenuItem href='/users' icon={<i className='ri-user-settings-line' />}>
          Pengguna
        </MenuItem>
        <MenuItem href='/master/species' icon={<i className='ri-seedling-line' />}>
          Master Spesies
        </MenuItem>
        <MenuItem href='/master/form-templates' icon={<i className='ri-survey-line' />}>
          Form Survei
        </MenuItem>
        <MenuItem href='/master/organizations' icon={<i className='ri-building-2-line' />}>
          Organisasi
        </MenuItem>
        <MenuItem href='/settings/account' icon={<i className='ri-shield-user-line' />}>
          Akun
        </MenuItem>
        <MenuItem href='/settings/system' icon={<i className='ri-key-2-line' />}>
          Sistem & Map
        </MenuItem>
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
