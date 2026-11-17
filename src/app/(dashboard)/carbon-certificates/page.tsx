'use client'

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

export default function CarbonCertificatesPage() {
  const certs = [
    {
      id: 'CERT-2026-0089',
      recipient: 'PT Telkom Indonesia (Persero) Tbk',
      package: 'Paket Adopsi Lestari (50 Pohon)',
      carbonOffset: '14.2 Ton CO₂e/tahun',
      issuedDate: '16 Nov 2026',
      status: 'ISSUED'
    },
    {
      id: 'CERT-2026-0088',
      recipient: 'Andi Wijaya',
      package: 'Adopsi Pohon Meranti Tunggal',
      carbonOffset: '0.28 Ton CO₂e/tahun',
      issuedDate: '15 Nov 2026',
      status: 'ISSUED'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Sertifikat Adopsi & Metodologi Karbon
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Pengelolaan template sertifikat terverifikasi, nomor seri kriptografis, dan kalkulasi serapan biomassa karbon.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-settings-4-line' />}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Konfigurasi Formula Karbon
        </Button>
      </Box>

      {/* Carbon Methodology Metric Card */}
      <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Metodologi Allometrik Biomassa Aktif</Typography>} />
            <CardContent>
              <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
                Kalkulasi serapan karbon menggunakan persamaan allometrik spesifik famili Dipterocarpaceae berdasarkan variabel DBH (Diameter at Breast Height) dan berat jenis kayu spesies.
              </Typography>
              <Chip label='Formula: Chave et al. (Tropical Moist Forest)' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Template Sertifikat Digital</Typography>} />
            <CardContent>
              <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
                Format sertifikat mencantumkan nama adopter, daftar tag QR pohon, koordinat GPS kawasan, tanda tangan digital pengelola kawasan, dan estimasi CO₂e.
              </Typography>
              <Chip label='Status Template: v2.1 Active' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificates Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Sertifikat Diterbitkan</Typography>} />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nomor Sertifikat</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Penerima Adopter</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Paket</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Serapan Karbon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tanggal Terbit</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Unduh</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certs.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{c.id}</Typography></TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 600 }}>{c.recipient}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{c.package}</Typography></TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 700, color: '#21865B' }}>{c.carbonOffset}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{c.issuedDate}</Typography></TableCell>
                  <TableCell align='right'>
                    <Button variant='outlined' size='small' startIcon={<i className='ri-file-pdf-line' />} sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none' }}>
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
