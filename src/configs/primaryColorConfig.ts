export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object (Kanopi Kita Theme Palette)
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'kanopi-primary',
    light: '#388E6E',
    main: '#176B4D', // Kanopi Forest Green
    dark: '#104D39'
  },
  {
    name: 'kanopi-sage',
    light: '#A3C2AA',
    main: '#83A98C', // Kanopi Sage
    dark: '#62876B'
  },
  {
    name: 'primary-2',
    light: '#49CCB5',
    main: '#06B999',
    dark: '#048770'
  },
  {
    name: 'primary-3',
    light: '#FFA95A',
    main: '#FF891D',
    dark: '#BA6415'
  },
  {
    name: 'primary-4',
    light: '#F07179',
    main: '#EB3D47',
    dark: '#AC2D34'
  }
]

export default primaryColorConfig
