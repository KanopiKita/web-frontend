'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

export default function TreesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedTree, setSelectedTree] = useState<any>(null)
  const [openModal, setOpenModal] = useState(false)

  const [trees, setTrees] = useState([
    {
      id: 'TREE-2026-0891',
      speciesLatin: 'Shorea leprosula',
      speciesLocal: 'Meranti Merah',
      area: 'Kawasan Hutan Adat Merangin',
      surveyor: 'Budi Hartono (SRV-04)',
      date: '16 Nov 2026',
      status: 'PENDING_REVIEW',
      health: 'Sehat (Daun Rimbun)',
      dbh: '48.5 cm',
      height: '24 m',
      lat: -2.1524,
      lng: 102.1342,
      notes: 'Batang lurus, tidak ada tanda hama rayap.'
    },
    {
      id: 'TREE-2026-0892',
      speciesLatin: 'Dipterocarpus gracilis',
      speciesLocal: 'Keruing',
      area: 'Taman Nasional Bukit Tigapuluh',
      surveyor: 'Siti Rahma (SRV-12)',
      date: '16 Nov 2026',
      status: 'PENDING_REVIEW',
      health: 'Sehat',
      dbh: '62.0 cm',
      height: '31 m',
      lat: -0.9842,
      lng: 102.4518,
      notes: 'Pohon indukan berpotensi menyerap karbon tinggi.'
    },
    {
      id: 'TREE-2026-0887',
      speciesLatin: 'Eusideroxylon zwageri',
      speciesLocal: 'Kayu Ulin',
      area: 'Kawasan Konservasi Kutai Barat',
      surveyor: 'Ahmad Fauzi (SRV-08)',
      date: '15 Nov 2026',
      status: 'REVISION_NEEDED',
      health: 'Sakit (Tajuk Kering)',
      dbh: '84.2 cm',
      height: '28 m',
      lat: -0.4215,
      lng: 115.8213,
      notes: 'Perlu verifikasi ulang kondisi kanopi di musim hujan.'
    },
    {
      id: 'TREE-2026-0885',
      speciesLatin: 'Aquilaria malaccensis',
      speciesLocal: 'Gaharu',
      area: 'Kawasan Konservasi Kutai Barat',
      surveyor: 'Ahmad Fauzi (SRV-08)',
      date: '15 Nov 2026',
      status: 'ELIGIBLE_ADOPTION',
      health: 'Sehat',
      dbh: '35.0 cm',
      height: '18 m',
      lat: -0.4289,
      lng: 115.8291,
      notes: 'Sudah disetujui untuk paket adopsi premium.'
    }
  ])

  const handleReviewClick = (tree: any) => {
    setSelectedTree(tree)
    setOpenModal(true)
  }

  const handleApprove = () => {
    if (selectedTree) {
      setTrees(prev =>
        prev.map(t => (t.id === selectedTree.id ? { ...t, status: 'ELIGIBLE_ADOPTION' } : t))
      )
    }
    setOpenModal(false)
  }

  const handleRequestRevision = () => {
    if (selectedTree) {
      setTrees(prev =>
        prev.map(t => (t.id === selectedTree.id ? { ...t, status: 'REVISION_NEEDED' } : t))
      )
    }
    setOpenModal(false)
  }

  const filteredTrees = trees.filter(t => filterStatus === 'ALL' || t.status === filterStatus)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Inventaris & Review Pohon Survei
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Validasi data hasil survei lapangan, evaluasi metrik DBH/kesehatan, dan penetapan kelayakan adopsi.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            select
            size='small'
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value='ALL'>Semua Status</MenuItem>
            <MenuItem value='PENDING_REVIEW'>Menunggu Review</MenuItem>
            <MenuItem value='ELIGIBLE_ADOPTION'>Siap Diadopsi</MenuItem>
            <MenuItem value='REVISION_NEEDED'>Butuh Revisi</MenuItem>
          </TextField>
          <Button
            variant='contained'
            startIcon={<i className='ri-download-2-line' />}
            sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
          >
            Ekspor Data (CSV)
          </Button>
        </Box>
      </Box>

      {/* Main Table Card */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tag ID & Spesies</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dimensi (DBH / Tinggi)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kondisi Kesehatan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Surveyor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Review</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrees.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                      {row.speciesLocal}
                    </Typography>
                    <Typography variant='caption' sx={{ fontStyle: 'italic', color: '#66756D', display: 'block' }}>
                      {row.speciesLatin}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{row.area}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>DBH: {row.dbh}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>Tinggi: {row.height}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ color: row.health.includes('Sakit') ? '#D94B4B' : '#21865B', fontWeight: 500 }}>
                      {row.health}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{row.surveyor}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{row.date}</Typography>
                  </TableCell>
                  <TableCell>
                    {row.status === 'PENDING_REVIEW' && (
                      <Chip label='Menunggu Review' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                    )}
                    {row.status === 'ELIGIBLE_ADOPTION' && (
                      <Chip label='Siap Diadopsi' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                    )}
                    {row.status === 'REVISION_NEEDED' && (
                      <Chip label='Butuh Revisi' size='small' sx={{ bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => handleReviewClick(row)}
                      sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                    >
                      Periksa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Review Modal Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#17251E' }}>
          Verifikasi Data Pohon Lapangan
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedTree && (
            <>
              <Box sx={{ p: 2, bgcolor: '#F7F9F7', borderRadius: '8px' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#176B4D' }}>
                  {selectedTree.speciesLocal} ({selectedTree.speciesLatin})
                </Typography>
                <Typography variant='caption' sx={{ color: '#66756D' }}>
                  ID: {selectedTree.id} • Lokasi: {selectedTree.area}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Diameter Batang (DBH)</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedTree.dbh}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Estimasi Tinggi</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedTree.height}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Koordinat GPS</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedTree.lat}, {selectedTree.lng}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Surveyor Lapangan</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedTree.surveyor}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant='caption' sx={{ color: '#66756D' }}>Catatan Lapangan:</Typography>
                <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 0.5 }}>{selectedTree.notes}</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#66756D' }}>
            Tutup
          </Button>
          <Button
            variant='outlined'
            onClick={handleRequestRevision}
            sx={{ borderColor: '#D94B4B', color: '#D94B4B', textTransform: 'none' }}
          >
            Minta Revisi Lapangan
          </Button>
          <Button
            variant='contained'
            onClick={handleApprove}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
          >
            Setujui (Siap Adopsi)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
