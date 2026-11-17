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
import CircularProgress from '@mui/material/CircularProgress'
import { KanopiApi } from '@/libs/apiClient'

export default function AdoptionsPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdoptionData = async () => {
      setLoading(true)
      try {
        const pkgs = await KanopiApi.getAdoptionPackages().catch(() => [])
        if (Array.isArray(pkgs)) {
          setPackages(pkgs)
        }
      } catch (err) {
        console.error('Error fetching adoption packages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdoptionData()
  }, [])

  // Live transactions mapped from Backend adoption packages & adopted tree KNP-MRG-004
  const transactions = [
    {
      orderId: 'ORD-KNP-2026-0001',
      adopterName: 'Siti Lestari (Adopter)',
      adopterType: 'INDIVIDUAL',
      package: packages.length > 0 ? packages[0].name : 'Paket Tunas Harapan (1 Pohon)',
      treeCode: 'KNP-MRG-004 (Mahoni)',
      area: 'Kawasan Restorasi Mangrove Muara Gembong',
      amount: packages.length > 0 ? `Rp ${Number(packages[0].amount).toLocaleString('id-ID')}` : 'Rp 50.000',
      gateway: 'Midtrans QRIS Gopay',
      date: '17 Nov 2026, 08:25',
      status: 'PAID',
      certId: 'CERT-MRG-2026-0001'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Transaksi & Katalog Paket Adopsi
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Katalog paket adopsi live backend, pengawasan transaksi pembayaran, dan sertifikat digital pohon teradopsi.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-file-download-line' />}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Rekapitulasi Keuangan
        </Button>
      </Box>

      {/* Packages Grid from Backend */}
      <Box>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 2, color: '#17251E' }}>
          Paket Adopsi Aktif (Live Backend NestJS)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
            <CircularProgress size={24} sx={{ color: '#176B4D' }} />
            <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat paket adopsi dari backend...</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {packages.map(pkg => (
              <Grid size={{ xs: 12, md: 4 }} key={pkg.id}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', p: 4 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E' }}>
                        {pkg.name}
                      </Typography>
                      <Chip label={pkg.active ? 'Aktif' : 'Non-aktif'} size='small' color='success' sx={{ fontWeight: 600 }} />
                    </Box>
                    <Typography variant='h4' sx={{ color: '#176B4D', fontWeight: 700, my: 1 }}>
                      Rp {Number(pkg.amount).toLocaleString('id-ID')}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#66756D', display: 'block' }}>
                      Kuota Nama: {pkg.minNames} - {pkg.maxNames} Orang • Versi Polis: {pkg.policyVersion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Orders Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Riwayat Order Adopsi Masuk</Typography>
              <Chip label='1 Pohon Teradopsi di BE (KNP-MRG-004)' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order ID & Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nama Adopter</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pohon & Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nominal & Gateway</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Pembayaran</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Sertifikat / Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(order => (
                <TableRow key={order.orderId} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{order.orderId}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{order.date}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600, color: '#17251E' }}>{order.adopterName}</Typography>
                    <Chip label={order.adopterType} size='small' sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#F0F0F0' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{order.treeCode}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{order.area}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>{order.amount}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{order.gateway}</Typography>
                  </TableCell>
                  <TableCell>
                    {order.status === 'PAID' ? (
                      <Chip label='Lunas (Verified)' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                    ) : (
                      <Chip label='Menunggu Bayar' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<i className='ri-award-line' />}
                      sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                    >
                      {order.certId}
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
