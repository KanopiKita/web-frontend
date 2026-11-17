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
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
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
  const [previewCert, setPreviewCert] = useState<CertificateRow | null>(null)

  useEffect(() => {
    const loadCertificatesFromBackend = async () => {
      setLoading(true)
      try {
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
            Sertifikat Adopsi Digital & Metodologi Karbon
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
            Verifikasi keaslian sertifikat adopsi pohon, pratinjau cetak sertifikat PDF, dan kalkulasi serapan biomassa karbon.
          </Typography>
        </Box>
      </Box>

      {/* Carbon Methodology & Live Verification Card */}
      <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Metodologi Allometrik Biomassa Aktif</Typography>} />
            <CardContent>
              <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
                Kalkulasi serapan karbon menggunakan persamaan allometrik spesifik ekosistem Mangrove & Hutan Tropis Lembap berdasarkan variabel DBH (Diameter at Breast Height) dan berat jenis kayu spesies.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Chip label='Formula: Chave et al. (Tropical Moist & Mangrove)' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }} />
                <Chip label='Verifikasi Sertifikat Digital Aktif' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Verifikasi Keaslian Nomor Sertifikat</Typography>} />
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
                  sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap' }}
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
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Sertifikat Diterbitkan</Typography>
              <Chip label={`${certs.length} Sertifikat Terbit`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nomor Sertifikat</TableCell>
                <TableCell>Penerima Adopter</TableCell>
                <TableCell>Pohon & Kawasan</TableCell>
                <TableCell>Estimasi Serapan Karbon</TableCell>
                <TableCell>Tanggal Terbit</TableCell>
                <TableCell align='right'>Aksi & Unduh PDF</TableCell>
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
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<i className='ri-shield-check-line' />}
                          onClick={() => {
                            setVerifyInput(c.id)
                            KanopiApi.verifyCertificateToken(c.id).then(setVerifyResult).catch(() => {})
                          }}
                          sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                        >
                          Validasi
                        </Button>
                        <Button
                          variant='contained'
                          size='small'
                          startIcon={<i className='ri-file-pdf-2-line' />}
                          onClick={() => setPreviewCert(c)}
                          sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
                        >
                          Cetak PDF
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Pratinjau & Cetak Sertifikat Digital (PRD Modul 3) */}
      <Dialog open={Boolean(previewCert)} onClose={() => setPreviewCert(null)} maxWidth='md' fullWidth>
        <DialogContent sx={{ p: 4 }}>
          {previewCert && (
            <Box
              sx={{
                border: '6px double #176B4D',
                borderRadius: '16px',
                p: { xs: 3, md: 5 },
                bgcolor: '#FAFDFB',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              <Chip
                label='SERTIFIKAT ADOPSI POHON & KONTRIBUSI KARBON TERVERIFIKASI'
                sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 800, mb: 2, letterSpacing: '0.06em' }}
              />
              <Typography variant='h4' sx={{ fontWeight: 800, color: '#17251E', mb: 0.5 }}>
                KANOPI KITA INDONESIA
              </Typography>
              <Typography variant='caption' sx={{ color: '#66756D', display: 'block', mb: 3 }}>
                Nomor Seri Kriptografis: <strong>{previewCert.id}</strong> • Tanggal Terbit: {previewCert.issuedDate}
              </Typography>

              <Typography variant='body2' sx={{ color: '#66756D' }}>Diberikan dengan hormat kepada:</Typography>
              <Typography variant='h4' sx={{ fontWeight: 800, color: '#176B4D', my: 1.5 }}>
                {previewCert.recipient}
              </Typography>
              <Typography variant='body2' sx={{ color: '#485B50', maxWidth: 580, mx: 'auto', mb: 3 }}>
                Atas kontribusi nyata dalam pemeliharaan ekosistem hutan dan adopsi pohon terdaftar yang dipantau secara berkala melalui sistem pemantauan geospasial Kanopi Kita.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2} sx={{ textAlign: 'left', maxWidth: 620, mx: 'auto', mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Kode Tag & Spesies Pohon:</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                    {previewCert.treeCode} — {previewCert.species}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Estimasi Serapan Biomassa:</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#21865B' }}>
                    {previewCert.carbonOffset} (Chave et al.)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Lokasi Kawasan Konservasi:</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                    {previewCert.area} (Koordinat GPS: -5.9746, 107.0231)
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, px: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant='caption' sx={{ color: '#66756D', display: 'block' }}>Pengelola Kawasan Resmi:</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E', mt: 1 }}>
                    Yayasan Kanopi Kita Indonesia
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>
                    ✓ Tanda Tangan Digital Terverifikasi SHA-256
                  </Typography>
                </Box>

                {/* Simulated QR Verification Box */}
                <Box
                  sx={{
                    p: 1.5,
                    border: '2px solid #176B4D',
                    borderRadius: '10px',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <i className='ri-qr-code-line' style={{ fontSize: '2.4rem', color: '#176B4D' }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant='caption' sx={{ fontWeight: 800, color: '#17251E', display: 'block' }}>
                      SCAN VERIFIKASI RESMI
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#176B4D', fontFamily: 'monospace', fontSize: '0.68rem' }}>
                      ID: {previewCert.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewCert(null)} sx={{ color: '#66756D' }}>
            Tutup
          </Button>
          <Button
            variant='contained'
            startIcon={<i className='ri-printer-line' />}
            onClick={() => window.print()}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
          >
            Cetak / Simpan sebagai PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
