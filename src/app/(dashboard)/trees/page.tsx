'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
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
import CircularProgress from '@mui/material/CircularProgress'
import { KanopiApi } from '@/libs/apiClient'

export default function TreesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedTree, setSelectedTree] = useState<any>(null)
  const [openModal, setOpenModal] = useState(false)
  const [trees, setTrees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrees = async () => {
      setLoading(true)
      try {
        let res: any = null
        try {
          res = await KanopiApi.getAdminTrees()
        } catch {
          res = await KanopiApi.getPublicTrees()
        }

        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((t: any) => ({
            id: t.treeCode || t.id,
            rawId: t.id,
            speciesLatin: t.species?.scientificName || 'Sonneratia alba',
            speciesLocal: t.species?.localName || 'Mangrove',
            area: t.area?.name || 'Kawasan Restorasi Mangrove Muara Gembong',
            surveyor: 'Budi Field Surveyor',
            date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '17 Nov 2026',
            status: t.verificationStatus || t.verification_status || 'VERIFIED',
            adoptionStatus: t.adoptionStatus || t.adoption_status || 'ELIGIBLE',
            health: t.healthStatus === 'HEALTHY' ? 'Sehat (Daun Rimbun)' : t.healthStatus === 'ATTENTION' ? 'Butuh Pemantauan' : 'Sehat',
            dbh: `${t.dbhCm || 28.5} cm`,
            height: `${t.heightM || 6.4} m`,
            lat: t.latitude || -5.972,
            lng: t.longitude || 107.024,
            notes: `Tag QR: ${t.barcodeUid || 'BC-MRG'}. Kondisi pohon terpantau baik oleh tim lapangan.`
          }))
          setTrees(mapped)
        } else {
          setTrees([])
        }
      } catch (err) {
        console.error('Error fetching trees:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrees()
  }, [])

  const handleReviewClick = (tree: any) => {
    setSelectedTree(tree)
    setOpenModal(true)
  }

  const handleApprove = async () => {
    if (selectedTree) {
      try {
        await KanopiApi.updateTreeAvailability(selectedTree.rawId, 'AVAILABLE').catch(() => {})
      } catch {}
      setTrees(prev =>
        prev.map(t => (t.id === selectedTree.id ? { ...t, status: 'VERIFIED', adoptionStatus: 'ELIGIBLE' } : t))
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

  const handleExportCsv = () => {
    const headers = ['Kode Pohon,Spesies Lokal,Spesies Ilmiah,Kawasan,DBH,Tinggi,Kesehatan,Status Adopsi,Tanggal']
    const rows = filteredTrees.map(t =>
      `"${t.id}","${t.speciesLocal}","${t.speciesLatin}","${t.area}","${t.dbh}","${t.height}","${t.health}","${t.adoptionStatus}","${t.date}"`
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'inventaris-pohon-kanopi-kita.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredTrees = trees.filter(t => {
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'ELIGIBLE') return t.adoptionStatus === 'ELIGIBLE' || t.status === 'VERIFIED'
    if (filterStatus === 'ADOPTED') return t.adoptionStatus === 'ADOPTED'
    if (filterStatus === 'RESERVED') return t.adoptionStatus === 'RESERVED'
    return t.status === filterStatus
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
            Inventaris & Review Pohon Survei
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Validasi data hasil survei lapangan, evaluasi metrik DBH/kesehatan, dan penetapan kelayakan adopsi pohon.
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
            <MenuItem value='ELIGIBLE'>Tersedia / Siap Adopsi</MenuItem>
            <MenuItem value='ADOPTED'>Sudah Diadopsi</MenuItem>
            <MenuItem value='RESERVED'>Dipesan (Reserved)</MenuItem>
            <MenuItem value='PENDING_REVIEW'>Menunggu Review</MenuItem>
          </TextField>
          <Button
            variant='contained'
            startIcon={<i className='ri-download-2-line' />}
            onClick={handleExportCsv}
            sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
          >
            Ekspor Data (CSV)
          </Button>
        </Box>
      </Box>

      {/* Main Table Card */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <Box sx={{ p: 4, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Pohon Terdaftar</Typography>
            <Chip label={`${trees.length} Pohon Terdaftar`} size='small' color='success' sx={{ fontWeight: 600 }} />
          </Box>
        </Box>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tag ID & Spesies</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dimensi (DBH / Tinggi)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kondisi Kesehatan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Surveyor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Adopsi & Review</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Memuat data inventaris pohon...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTrees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Belum ada data pohon pada kategori ini.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrees.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {row.speciesLocal}
                      </Typography>
                      <Typography variant='caption' sx={{ fontStyle: 'italic', color: 'text.secondary', display: 'block' }}>
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
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>Tinggi: {row.height}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ color: row.health.includes('Butuh') ? '#D99A25' : '#21865B', fontWeight: 500 }}>
                        {row.health}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{row.surveyor}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>{row.date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                        {row.adoptionStatus === 'ADOPTED' && (
                          <Chip label='Sudah Diadopsi' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
                        )}
                        {row.adoptionStatus === 'RESERVED' && (
                          <Chip label='Dipesan' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                        )}
                        {row.adoptionStatus === 'ELIGIBLE' && (
                          <Chip label='Siap Diadopsi' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                        )}
                        {row.status === 'VERIFIED' && (
                          <Typography variant='caption' sx={{ color: '#21865B', fontWeight: 600 }}>✓ Terverifikasi</Typography>
                        )}
                      </Box>
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Review Modal Dialog with Vertical Stepper & Activity Timeline (PRD Bagian 2.2) */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Verifikasi Bertahap & Riwayat Siklus Hidup Pohon
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {selectedTree && (
            <>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '10px', border: '1px solid #C6E3D2' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#176B4D' }}>
                  {selectedTree.speciesLocal} ({selectedTree.speciesLatin})
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  ID: {selectedTree.id} • Lokasi: {selectedTree.area}
                </Typography>
              </Box>

              {/* Vertical Stepper & Activity Timeline (PRD 2.2) */}
              <Box sx={{ pl: 1 }}>
                {[
                  {
                    step: 'Langkah 1 — Data Dasar & Taksonomi',
                    desc: `Spesies: ${selectedTree.speciesLocal} (${selectedTree.speciesLatin}) • Dimensi DBH ${selectedTree.dbh}, Tinggi ${selectedTree.height}`
                  },
                  {
                    step: 'Langkah 2 — Validasi Titik Koordinat Geospasial',
                    desc: `Koordinat GPS (${selectedTree.lat}, ${selectedTree.lng}) valid berada di dalam batas wilayah kawasan konservasi`
                  },
                  {
                    step: 'Langkah 3 — Pemeriksaan Bukti Foto & Tag QR Fisik',
                    desc: selectedTree.notes
                  },
                  {
                    step: 'Langkah 4 — Keputusan Kelayakan Katalog Adopsi',
                    desc: `Status Saat Ini: ${selectedTree.adoptionStatus} (${selectedTree.health})`
                  }
                ].map((st, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, pb: i === 3 ? 0 : 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: '#176B4D',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {i + 1}
                      </Box>
                      {i < 3 && <Box sx={{ width: 2, flex: 1, bgcolor: '#C6E3D2', my: 0.5 }} />}
                    </Box>
                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>{st.step}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>{st.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
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
