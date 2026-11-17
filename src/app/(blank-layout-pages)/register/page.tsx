// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Register from '@views/Register'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Register - Kanopi Kita Backoffice',
  description: 'Daftarkan akun pengelola kawasan konservasi atau mitra adopsi Kanopi Kita'
}

const RegisterPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <Register mode={mode} />
}

export default RegisterPage
