'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Map, { Source, Layer, Marker, Popup, NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import MapboxMap, {
  Source as MbSource,
  Layer as MbLayer,
  Marker as MbMarker,
  Popup as MbPopup,
  NavigationControl as MbNavigationControl,
  ScaleControl as MbScaleControl
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'maplibre-gl/dist/maplibre-gl.css'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

export interface GisAreaItem {
  id: string
  name: string
  location: string
  hectares: string
  totalTrees: number
  adoptedTrees: number
  legalStatus: string
  publishStatus: string
  manager: string
  boundariesGeojson?: any
}

export interface GisTreePoint {
  id: string
  treeCode: string
  speciesLocal: string
  speciesLatin: string
  healthStatus: string
  adoptionStatus: string
  lat: number
  lng: number
  dbh: string
  height: string
  areaName: string
}

interface KanopiWebGisMapProps {
  areas: GisAreaItem[]
  trees: GisTreePoint[]
  selectedAreaId?: string | null
}

// Mapbox GL Style Spec v8 (Satellite Hybrid & Outdoors Topographic) untuk fallback instan bila token pk.* belum disetel
const SATELLITE_STYLE_SPEC: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Mapbox GL / Esri World Imagery'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

const STREETS_STYLE_SPEC: any = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'Mapbox GL / OpenStreetMap'
    }
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

export default function KanopiWebGisMap({ areas, trees, selectedAreaId }: KanopiWebGisMapProps) {
  const mapRef = useRef<any>(null)

  const [mapboxToken, setMapboxToken] = useState<string>(
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
  )
  const [tokenModalOpen, setTokenModalOpen] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [basemapMode, setBasemapMode] = useState<'satellite' | 'streets'>('satellite')
  const [showPolygons, setShowPolygons] = useState(true)
  const [showTrees, setShowTrees] = useState(true)
  const [selectedTree, setSelectedTree] = useState<GisTreePoint | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kanopi_mapbox_token')
      if (saved) setMapboxToken(saved)
    }
  }, [])

  // Susun GeoJSON FeatureCollection dari boundaries_geojson PostGIS Backend
  const areasGeoJson = useMemo(() => {
    const features = areas
      .filter(a => a.boundariesGeojson)
      .map(a => ({
        type: 'Feature',
        properties: {
          id: a.id,
          name: a.name,
          hectares: a.hectares,
          publishStatus: a.publishStatus
        },
        geometry: a.boundariesGeojson
      }))

    // Fallback default polygon Muara Gembong bila belum ada di respons
    if (features.length === 0) {
      features.push({
        type: 'Feature',
        properties: {
          id: '20000000-0000-0000-0000-000000000001',
          name: 'Kawasan Restorasi Mangrove Muara Gembong',
          hectares: '15 Ha',
          publishStatus: 'PUBLISHED'
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [107.015, -5.965],
                [107.035, -5.965],
                [107.035, -5.98],
                [107.015, -5.98],
                [107.015, -5.965]
              ]
            ]
          ]
        }
      })
    }

    return {
      type: 'FeatureCollection',
      features
    }
  }, [areas])

  // FlyTo saat area dipilih dari tabel
  useEffect(() => {
    if (!selectedAreaId || !mapRef.current) return
    const target = areas.find(a => a.id === selectedAreaId)
    const coords = target?.boundariesGeojson?.coordinates?.[0]?.[0]?.[0]
    if (Array.isArray(coords) && coords.length >= 2) {
      mapRef.current.flyTo({ center: [coords[0] + 0.008, coords[1] - 0.006], zoom: 14.5, duration: 1200 })
    } else {
      mapRef.current.flyTo({ center: [107.025, -5.972], zoom: 14.5, duration: 1200 })
    }
  }, [selectedAreaId, areas])

  const handleSaveToken = () => {
    const trimmed = tempToken.trim()
    setMapboxToken(trimmed)
    if (typeof window !== 'undefined') {
      if (trimmed) localStorage.setItem('kanopi_mapbox_token', trimmed)
      else localStorage.removeItem('kanopi_mapbox_token')
    }
    setTokenModalOpen(false)
  }

  const getMarkerColor = (status: string) => {
    if (status === 'ADOPTED') return '#3478C0'
    if (status === 'RESERVED') return '#D99A25'
    return '#21865B'
  }

  const hasValidPkToken = mapboxToken.startsWith('pk.') && mapboxToken.length > 20

  const polygonFillLayer: any = {
    id: 'kanopi-area-fill',
    type: 'fill',
    paint: {
      'fill-color': '#21865B',
      'fill-opacity': 0.32
    }
  }

  const polygonOutlineLayer: any = {
    id: 'kanopi-area-outline',
    type: 'line',
    paint: {
      'line-color': '#C8E66A',
      'line-width': 3
    }
  }

  const renderMapContents = (
    SourceComp: any,
    LayerComp: any,
    MarkerComp: any,
    PopupComp: any,
    NavComp: any,
    ScaleComp: any
  ) => (
    <>
      <NavComp position='top-right' />
      <ScaleComp position='bottom-right' />

      {showPolygons && (
        <SourceComp id='kanopi-areas-source' type='geojson' data={areasGeoJson as any}>
          <LayerComp {...polygonFillLayer} />
          <LayerComp {...polygonOutlineLayer} />
        </SourceComp>
      )}

      {showTrees &&
        trees.map(tree => (
          <MarkerComp
            key={tree.id}
            longitude={tree.lng}
            latitude={tree.lat}
            anchor='bottom'
            onClick={(e: any) => {
              e.originalEvent?.stopPropagation()
              setSelectedTree(tree)
            }}
          >
            <Box
              sx={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.15s ease',
                '&:hover': { transform: 'scale(1.18)' }
              }}
            >
              <Box
                sx={{
                  bgcolor: getMarkerColor(tree.adoptionStatus),
                  color: '#fff',
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                  border: '1.5px solid #ffffff',
                  whiteSpace: 'nowrap'
                }}
              >
                🌲 {tree.treeCode}
              </Box>
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: `6px solid ${getMarkerColor(tree.adoptionStatus)}`
                }}
              />
            </Box>
          </MarkerComp>
        ))}

      {selectedTree && (
        <PopupComp
          longitude={selectedTree.lng}
          latitude={selectedTree.lat}
          anchor='top'
          onClose={() => setSelectedTree(null)}
          closeOnClick={false}
        >
          <Box sx={{ p: 1, minWidth: 210 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#176B4D' }}>
              {selectedTree.treeCode} — {selectedTree.speciesLocal}
            </Typography>
            <Typography variant='caption' sx={{ fontStyle: 'italic', color: '#66756D', display: 'block', mb: 1 }}>
              {selectedTree.speciesLatin}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: '#17251E' }}>
              <strong>Kawasan:</strong> {selectedTree.areaName}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: '#17251E' }}>
              <strong>Dimensi:</strong> DBH {selectedTree.dbh} • Tinggi {selectedTree.height}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: '#17251E' }}>
              <strong>Koordinat:</strong> {selectedTree.lat.toFixed(4)}, {selectedTree.lng.toFixed(4)}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip
                label={selectedTree.adoptionStatus}
                size='small'
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: '#E7F3EC',
                  color: '#176B4D',
                  fontWeight: 700
                }}
              />
              <Chip
                label={selectedTree.healthStatus}
                size='small'
                sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#F0F0F0', fontWeight: 600 }}
              />
            </Box>
          </Box>
        </PopupComp>
      )}
    </>
  )

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 420 }}>
      {/* Top Overlay Toolbar */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(6px)',
          p: 1,
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
        }}
      >
        <Chip
          icon={<i className='ri-Focus-3-line' />}
          label='Fokus Muara Gembong'
          size='small'
          clickable
          onClick={() => mapRef.current?.flyTo({ center: [107.025, -5.972], zoom: 14.5, duration: 1000 })}
          sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        />
        <Chip
          label={basemapMode === 'satellite' ? '🛰️ Citra Satelit' : '🗺️ Peta Jalan'}
          size='small'
          clickable
          onClick={() => setBasemapMode(prev => (prev === 'satellite' ? 'streets' : 'satellite'))}
          sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }}
        />
        <Chip
          label={showPolygons ? '✓ Layer Polygon Kawasan' : 'Layer Polygon Kawasan'}
          size='small'
          clickable
          onClick={() => setShowPolygons(prev => !prev)}
          sx={{
            bgcolor: showPolygons ? '#E7F3EC' : '#F0F0F0',
            color: showPolygons ? '#176B4D' : '#66756D',
            fontWeight: 600
          }}
        />
        <Chip
          label={showTrees ? `✓ Layer Titik Pohon (${trees.length})` : `Layer Titik Pohon (${trees.length})`}
          size='small'
          clickable
          onClick={() => setShowTrees(prev => !prev)}
          sx={{
            bgcolor: showTrees ? '#FEF6E6' : '#F0F0F0',
            color: showTrees ? '#D99A25' : '#66756D',
            fontWeight: 600
          }}
        />
        <IconButton
          size='small'
          title='Konfigurasi Mapbox Access Token'
          onClick={() => {
            setTempToken(mapboxToken)
            setTokenModalOpen(true)
          }}
          sx={{ width: 26, height: 26, bgcolor: '#F0F0F0' }}
        >
          <i className='ri-key-2-line' style={{ fontSize: '0.9rem', color: '#176B4D' }} />
        </IconButton>
      </Box>

      {/* Bottom Legend Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'rgba(255,255,255,0.92)',
          px: 2,
          py: 0.75,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#21865B' }} />
          <Typography variant='caption' sx={{ fontWeight: 600, color: '#17251E' }}>Siap Adopsi</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3478C0' }} />
          <Typography variant='caption' sx={{ fontWeight: 600, color: '#17251E' }}>Sudah Diadopsi</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#D99A25' }} />
          <Typography variant='caption' sx={{ fontWeight: 600, color: '#17251E' }}>Dipesan / Pantau</Typography>
        </Box>
      </Box>

      {/* Mapbox GL / WebGL Canvas */}
      {hasValidPkToken ? (
        <MapboxMap
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: 107.025,
            latitude: -5.972,
            zoom: 14.2
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={
            basemapMode === 'satellite'
              ? 'mapbox://styles/mapbox/satellite-streets-v12'
              : 'mapbox://styles/mapbox/outdoors-v12'
          }
        >
          {renderMapContents(MbSource, MbLayer, MbMarker, MbPopup, MbNavigationControl, MbScaleControl)}
        </MapboxMap>
      ) : (
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 107.025,
            latitude: -5.972,
            zoom: 14.2
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={basemapMode === 'satellite' ? SATELLITE_STYLE_SPEC : STREETS_STYLE_SPEC}
        >
          {renderMapContents(Source, Layer, Marker, Popup, NavigationControl, ScaleControl)}
        </Map>
      )}

      {/* Modal Set Mapbox Token */}
      <Dialog open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Konfigurasi Mapbox Access Token</DialogTitle>
        <DialogContent dividers>
          <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
            Masukkan public token Mapbox Anda (diawali <code>pk.</code>) untuk menggunakan tile vektor kustom <code>mapbox://styles/mapbox/satellite-streets-v12</code>. Jika dikosongkan, peta otomatis merender citra satelit Esri World Imagery & OpenStreetMap di atas engine WebGL Mapbox Spec v8.
          </Typography>
          <TextField
            fullWidth
            size='small'
            label='Mapbox Public Token (pk.eyJ...)'
            value={tempToken}
            onChange={e => setTempToken(e.target.value)}
            placeholder='pk.eyJ1Ijoi...'
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setTokenModalOpen(false)} sx={{ textTransform: 'none', color: '#66756D' }}>
            Batal
          </Button>
          <Button
            variant='contained'
            onClick={handleSaveToken}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
          >
            Simpan Token
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
