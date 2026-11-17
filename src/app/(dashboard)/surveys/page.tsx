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

export default function SurveysPage() {
  const surveys = [
    {
      batchId: 'BATCH-2026-11-01',
      area: 'Kawasan Hutan Adat Merangin',
      surveyor: 'Budi Hartono',
      totalTreesSubmitted: 45,
      date: '16 Nov 2026',
      syncStatus: 'SYNCED_ONLINE',
      reviewStatus: 'UNDER_REVIEW'
    },
    {
      batchId: 'BATCH-2026-11-02',
      area: 'Taman Nasional Bukit Tigapuluh',
      surveyor: 'Siti Rahma',
      totalTreesSubmitted: 30,
      date: '15 Nov 2026',
      syncStatus: 'SYNCED_ONLINE',
      reviewStatus: 'APPROVED'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Batch Hasil Survei Lapangan
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Sinkronisasi data batch dari aplikasi mobile surveyor (offline sync ingestion) dan riwayat pengiriman data.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Pengiriman Batch Survei</Typography>} />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Batch ID & Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Surveyor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Jumlah Pohon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Review</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveys.map(item => (
                <TableRow key={item.batchId} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{item.batchId}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{item.date}</Typography>
                  </TableCell>
                  <TableCell><Typography variant='body2'>{item.area}</Typography></TableCell>
                  <TableCell><Typography variant='body2'>{item.surveyor}</Typography></TableCell>
                  <TableCell><Typography variant='body2' sx={{ fontWeight: 600 }}>{item.totalTreesSubmitted} Pohon</Typography></TableCell>
                  <TableCell>
                    {item.reviewStatus === 'APPROVED' ? (
                      <Chip label='Disetujui' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                    ) : (
                      <Chip label='Sedang Ditinjau' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <Button variant='outlined' size='small' sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none' }}>
                      Detail Batch
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
