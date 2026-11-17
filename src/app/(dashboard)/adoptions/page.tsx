'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
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

export default function AdoptionsPage() {
  const transactions = [
    {
      orderId: 'ORD-2026-1104',
      adopterName: 'PT Telkom Indonesia (CSR)',
      adopterType: 'CORPORATE',
      package: 'Paket Adopsi Lestari (50 Pohon)',
      area: 'Kawasan Hutan Adat Merangin',
      amount: 'Rp 15.000.000',
      gateway: 'BCA Virtual Account',
      date: '16 Nov 2026, 09:30',
      status: 'PAID',
      certId: 'CERT-2026-0089'
    },
    {
      orderId: 'ORD-2026-1103',
      adopterName: 'Andi Wijaya',
      adopterType: 'INDIVIDUAL',
      package: 'Adopsi Pohon Meranti Tunggal',
      area: 'Taman Nasional Bukit Tigapuluh',
      amount: 'Rp 300.000',
      gateway: 'QRIS Gopay',
      date: '15 Nov 2026, 19:15',
      status: 'PAID',
      certId: 'CERT-2026-0088'
    },
    {
      orderId: 'ORD-2026-1102',
      adopterName: 'Yayasan Bakti Bumi',
      adopterType: 'COMMUNITY',
      package: 'Paket Konservasi Ulin (10 Pohon)',
      area: 'Kawasan Konservasi Kutai Barat',
      amount: 'Rp 3.500.000',
      gateway: 'Mandiri Virtual Account',
      date: '15 Nov 2026, 14:02',
      status: 'PENDING_PAYMENT',
      certId: '-'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Transaksi & Invoicing Adopsi
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Pengawasan pembayaran adopsi dari aplikasi mobile adopter, rekonsiliasi gateway, dan penerbitan sertifikat digital.
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

      {/* Orders Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Riwayat Order Adopsi Masuk</Typography>} />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order ID & Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nama Adopter</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Paket & Kawasan</TableCell>
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
                    <Typography variant='body2'>{order.package}</Typography>
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
                    {order.status === 'PAID' ? (
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<i className='ri-award-line' />}
                        sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                      >
                        {order.certId}
                      </Button>
                    ) : (
                      <Typography variant='caption' sx={{ color: '#999999' }}>Menunggu Pembayaran</Typography>
                    )}
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
