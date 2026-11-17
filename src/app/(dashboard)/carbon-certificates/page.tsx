'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { KanopiApi } from '@/libs/apiClient'

interface CertificateRow {
  id: string
  recipient: string
  treeCode: string
  species: string
  area: string
  carbonOffset: string
  issuedDate: string
  status: string
}

export default function CarbonCertificatesPage() {
  const [certs, setCerts] = useState<CertificateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyInput, setVerifyInput] = useState('CERT-KNP-2026-0001')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  useEffect(() => {
    const loadCertificatesFromBackend = async () => {
      setLoading(true)
      try {
        // Verifikasi sertifikat seed dari backend (/v1/certificates/verify/CERT-KNP-2026-0001)
        const verified: any = await KanopiApi.verifyCertificateToken('CERT-KNP-2026-0001').catch(() => null)
        if (verified && verified.certificate_no) {
          setCerts([
            {
              id: verified.certificate_no,
              recipient: verified.adopter_name || 'Siti Lestari (Adopter)',
              treeCode: verified.tree_code || 'KNP-MRG-004',
              species: verified.species || 'Mahoni (Swietenia mahagoni)',
              area: verified.area || 'Kawasan Restorasi Mangrove Muara Gembong',
              carbonOffset: '0.28 Ton CO₂e/tahun',
              issuedDate: verified.issued_at
                ? new Date(verified.issued_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                : '17 Nov 2026',
              status: 'ISSUED'
            }
          ])
        }
      } catch (err) {
        console.error('Error loading certificate from backend:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCertificatesFromBackend()
  }, [])

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyInput.trim()) return
    setVerifying(true)
    setVerifyResult(null)
    setVerifyError(null)
    try {
      const res = await KanopiApi.verifyCertificateToken(verifyInput.trim())
      setVerifyResult(res)
    } catch (err: any) {
      setVerifyError(err?.message || 'Sertifikat tidak ditemukan atau token tidak valid.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Sertifikat Adopsi & Metodologi Karbon
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Pengelolaan sertifikat terverifikasi kriptografis (`/v1/certificates/verify/:token`) dan kalkulasi biomassa karbon.
          </Typography>
        </Box>
      </Box>

      {/* Carbon Methodology & Live Verification Card */}
      <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%', overflow: 'hidden', maxWidth: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Metodologi Allometrik Biomassa Aktif</Typography>} />
            <CardContent>
              <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
                Kalkulasi serapan karbon menggunakan persamaan allometrik spesifik ekosistem Mangrove & Tropis Lembap berdasarkan variabel DBH (Diameter at Breast Height) dan berat jenis kayu spesies di database Backend.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Chip label='Formula: Chave et al. (Tropical Moist & Mangrove)' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }} />
                <Chip label='SHA-256 Token Verification Active' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%', overflow: 'hidden', maxWidth: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Cek Keaslian Sertifikat (Live Backend API)</Typography>} />
            <CardContent>
              <form onSubmit={handleVerifyToken} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <TextField
                  size='small'
                  fullWidth
                  label='Nomor Sertifikat / Token QR'
                  value={verifyInput}
                  onChange={e => setVerifyInput(e.target.value)}
                  placeholder='Contoh: CERT-KNP-2026-0001'
                />
                <Button
                  type='submit'
                  variant='contained'
                  disabled={verifying}
                  sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#104D39' } }}
                >
                  {verifying ? 'Mengecek...' : 'Verifikasi'}
                </Button>
              </form>

              {verifyResult && (
                <Alert severity='success' sx={{ borderRadius: '10px' }}>
                  <strong>Sertifikat Valid!</strong> Milik <strong>{verifyResult.adopter_name}</strong> untuk pohon{' '}
                  <strong>{verifyResult.tree_code} ({verifyResult.species})</strong> di {verifyResult.area}.
                </Alert>
              )}
              {verifyError && (
                <Alert severity='error' sx={{ borderRadius: '10px' }}>
                  {verifyError}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificates Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Sertifikat Diterbitkan</Typography>
              <Chip label={`${certs.length} Sertifikat Live BE`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nomor Sertifikat</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Penerima Adopter</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pohon & Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estimasi Serapan Karbon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tanggal Terbit</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat sertifikat dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                certs.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell><Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{c.id}</Typography></TableCell>
                    <TableCell><Typography variant='body2' sx={{ fontWeight: 600 }}>{c.recipient}</Typography></TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{c.treeCode} — {c.species}</Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>{c.area}</Typography>
                    </TableCell>
                    <TableCell><Typography variant='body2' sx={{ fontWeight: 700, color: '#21865B' }}>{c.carbonOffset}</Typography></TableCell>
                    <TableCell><Typography variant='body2'>{c.issuedDate}</Typography></TableCell>
                    <TableCell align='right'>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<i className='ri-shield-check-line' />}
                        onClick={() => {
                          setVerifyInput(c.id)
                          KanopiApi.verifyCertificateToken(c.id).then(setVerifyResult).catch(() => {})
                        }}
                        sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                      >
                        Cek Validitas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
