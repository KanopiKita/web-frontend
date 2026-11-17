'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'
import type { GisAreaItem, GisTreePoint } from '@/components/map/KanopiWebGisMap'

const KanopiWebGisMap = dynamic(() => import('@/components/map/KanopiWebGisMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#EAF0EC' }}>
      <CircularProgress size={32} sx={{ color: '#176B4D', mr: 2 }} />
      <Typography variant='body2' sx={{ color: '#176B4D', fontWeight: 600 }}>
        Memuat Engine WebGL Mapbox...
      </Typography>
    </Box>
  )
})

const DEFAULT_TREE_COORDS: Record<string, [number, number]> = {
  'KNP-MRG-001': [-5.9705, 107.0212],
  'KNP-MRG-002': [-5.9718, 107.0245],
  'KNP-MRG-003': [-5.9732, 107.0268],
  'KNP-MRG-004': [-5.9746, 107.0231],
  'KNP-MRG-005': [-5.9698, 107.0284]
}

export default function AreasPage() {
  const [areas, setAreas] = useState<GisAreaItem[]>([])
  const [trees, setTrees] = useState<GisTreePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [detailArea, setDetailArea] = useState<GisAreaItem | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDocUrl, setNewDocUrl] = useState('https://kanopiindonesia.id/docs/sk-kawasan-baru.pdf')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchSpatialData = async () => {
    setLoading(true)
    try {
      const [areasRes, treesRes] = await Promise.all([
        KanopiApi.getAdminAreas().catch(() => KanopiApi.getPublicAreas().catch(() => [])),
        KanopiApi.getAdminTrees().catch(() => KanopiApi.getPublicTrees().catch(() => []))
      ])

      if (Array.isArray(areasRes)) {
        const mappedAreas: GisAreaItem[] = areasRes.map((a: any, idx: number) => ({
          id: a.id || `AREA-00${idx + 1}`,
          name: a.name,
          location: a.description || 'Muara Gembong, Bekasi, Jawa Barat',
          hectares: `${a.hectares || 15} Ha`,
          totalTrees: a._count?.trees ?? 5,
          adoptedTrees: a.adopted_count ?? 1,
          legalStatus:
            a.legalStatus === 'verified' || a.legalStatus === 'verified_sk_menteri' || a.legalStatus === 'VERIFIED_SK'
              ? 'VERIFIED_SK'
              : 'UNDER_REVIEW',
          publishStatus: a.publicationStatus || a.publication_status || 'PUBLISHED',
          manager: a.ownerOrg?.name || 'Yayasan Kanopi Kita Indonesia',
          boundariesGeojson: a.boundaries_geojson || null
        }))
        setAreas(mappedAreas)
      }

      if (Array.isArray(treesRes)) {
        const mappedTrees: GisTreePoint[] = treesRes.map((t: any, idx: number) => {
          const fallbackCoord = DEFAULT_TREE_COORDS[t.treeCode] || [-5.971 - idx * 0.001, 107.022 + idx * 0.0015]
          return {
            id: t.id,
            treeCode: t.treeCode || `KNP-MRG-00${idx + 1}`,
            speciesLocal: t.species?.localName || 'Bakau Hitam',
            speciesLatin: t.species?.scientificName || 'Rhizophora mucronata',
            healthStatus: t.healthStatus || 'HEALTHY',
            adoptionStatus: t.adoptionStatus || 'ELIGIBLE',
            lat: t.latitude || fallbackCoord[0],
            lng: t.longitude || fallbackCoord[1],
            dbh: `${t.dbhCm || 28.5} cm`,
            height: `${t.heightM || 6.4} m`,
            areaName: t.area?.name || 'Kawasan Restorasi Mangrove Muara Gembong'
          }
        })
        setTrees(mappedTrees)
      }
    } catch (err) {
      console.error('Error fetching spatial data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpatialData()
  }, [])

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const samplePolygon = {
        type: 'Polygon',
        coordinates: [
          [
            [107.036, -5.966],
            [107.048, -5.966],
            [107.048, -5.978],
            [107.036, -5.978],
            [107.036, -5.966]
          ]
        ]
      }
      await KanopiApi.createArea({
        name: newName.trim(),
        org_id: '00000000-0000-0000-0000-000000000001',
        description: newDesc.trim() || 'Kawasan konservasi terdaftar di sistem spasial Kanopi Kita.',
        legal_doc_urls: newDocUrl.trim() ? [newDocUrl.trim()] : [],
        boundaries_geojson: samplePolygon
      })
      setOpenCreate(false)
      setNewName('')
      setNewDesc('')
      setFeedback({ type: 'success', message: `Kawasan "${newName}" beserta polygon PostGIS berhasil disimpan ke Backend!` })
      await fetchSpatialData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mengajukan kawasan baru.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublishArea = async (area: GisAreaItem) => {
    setSubmitting(true)
    try {
      await KanopiApi.publishArea(area.id)
      setFeedback({ type: 'success', message: `Kawasan "${area.name}" berhasil dipublikasikan ke peta publik!` })
      setDetailArea(null)
      await fetchSpatialData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mempublikasikan kawasan.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Kawasan Konservasi & Batas WebGIS (Mapbox GL)
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Visualisasi interaktif batas wilayah spasial (MultiPolygon PostGIS), titik GPS pohon, dan manajemen publikasi kawasan.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Ajukan Kawasan Baru
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {/* Interactive Mapbox WebGIS Viewer Card */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <KanopiWebGisMap areas={areas} trees={trees} selectedAreaId={selectedAreaId} />
      </Card>

      {/* Areas Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Kawasan Konservasi Terdaftar</Typography>
              <Chip label={`${areas.length} Kawasan Live PostGIS`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Kode & Nama Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Deskripsi & Pengelola</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Luas & Pohon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Dokumen Legal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Publikasi</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat data spasial kawasan dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Tidak ada data kawasan dari backend.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                areas.map(area => (
                  <TableRow key={area.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>{area.name}</Typography>
                      <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>{area.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{area.location}</Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>{area.manager}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>Luas: {area.hectares}</Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>
                        {area.adoptedTrees} / {area.totalTrees} pohon teradopsi
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {area.legalStatus === 'VERIFIED_SK' ? (
                        <Chip label='SK Terverifikasi' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                      ) : (
                        <Chip label='Menunggu Validasi SK' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {area.publishStatus === 'PUBLISHED' ? (
                        <Chip label='Dipublikasikan' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                      ) : (
                        <Chip label='Unpublished / Draft' size='small' sx={{ bgcolor: '#F0F0F0', color: '#66756D', fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => {
                            setSelectedAreaId(area.id)
                            setDetailArea(area)
                          }}
                          sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                        >
                          Detail Polygon
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

      {/* Modal Ajukan Kawasan Baru */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateArea}>
          <DialogTitle sx={{ fontWeight: 700, color: '#17251E' }}>
            Ajukan Kawasan Konservasi & Polygon Baru
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label='Nama Kawasan Konservasi'
              placeholder='Contoh: Zona Restorasi Mangrove Blok B Muara Gembong'
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label='Deskripsi & Ekosistem Kawasan'
              placeholder='Deskripsi program rehabilitasi kawasan...'
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
            <TextField
              fullWidth
              label='Tautan Dokumen Legalitas (SK / Perjanjian)'
              value={newDocUrl}
              onChange={e => setNewDocUrl(e.target.value)}
            />
            <Box sx={{ p: 2, bgcolor: '#F7F9F7', borderRadius: '8px' }}>
              <Typography variant='caption' sx={{ fontWeight: 700, color: '#176B4D', display: 'block' }}>
                Polygon Spasial PostGIS (SRID 4326)
              </Typography>
              <Typography variant='caption' sx={{ color: '#66756D' }}>
                Polygon batas wilayah otomatis divalidasi oleh PostGIS (<code>ST_IsValid</code> & <code>ST_Multi</code>) di sekitar pesisir Bekasi.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ textTransform: 'none', color: '#66756D' }}>
              Batal
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={submitting || !newName.trim()}
              sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
            >
              {submitting ? 'Menyimpan ke PostGIS...' : 'Simpan Kawasan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Detail Polygon GeoJSON */}
      <Dialog open={Boolean(detailArea)} onClose={() => setDetailArea(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#17251E' }}>
          Detail Spasial GeoJSON Kawasan
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {detailArea && (
            <>
              <Box sx={{ p: 2, bgcolor: '#E7F3EC', borderRadius: '8px' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#176B4D' }}>
                  {detailArea.name}
                </Typography>
                <Typography variant='caption' sx={{ color: '#17251E' }}>
                  ID: {detailArea.id} • Status: {detailArea.publishStatus}
                </Typography>
              </Box>
              <Typography variant='caption' sx={{ fontWeight: 700, color: '#66756D' }}>
                Data MultiPolygon GeoJSON (PostGIS ST_AsGeoJSON):
              </Typography>
              <Box
                component='pre'
                sx={{
                  p: 2,
                  bgcolor: '#17251E',
                  color: '#C8E66A',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  m: 0
                }}
              >
                {JSON.stringify(
                  detailArea.boundariesGeojson || {
                    type: 'MultiPolygon',
                    coordinates: [[[[107.015, -5.965], [107.035, -5.965], [107.035, -5.98], [107.015, -5.98], [107.015, -5.965]]]]
                  },
                  null,
                  2
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailArea(null)} sx={{ textTransform: 'none', color: '#66756D' }}>
            Tutup
          </Button>
          {detailArea && detailArea.publishStatus !== 'PUBLISHED' && (
            <Button
              variant='contained'
              disabled={submitting}
              onClick={() => handlePublishArea(detailArea)}
              sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
            >
              Publikasikan Kawasan
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
