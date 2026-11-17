'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { KanopiApi, getApiBaseUrl } from '@/libs/apiClient'

export default function SystemSettingsPage() {
  const [mapboxToken, setMapboxToken] = useState('')
  const [defaultMapStyle, setDefaultMapStyle] = useState('satellite-streets-v12')
  const [pingMs, setPingMs] = useState<number | null>(null)
  const [apiOnline, setApiOnline] = useState(true)
  const [checkingPing, setCheckingPing] = useState(false)
  const [webhookProvider, setWebhookProvider] = useState<'midtrans' | 'xendit'>('midtrans')
  const [webhookOrderNo, setWebhookOrderNo] = useState('ORD-KNP-2026-0001')
  const [simulating, setSimulating] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('kanopi_mapbox_token') || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
      const savedStyle = localStorage.getItem('kanopi_mapbox_style') || 'satellite-streets-v12'
      setMapboxToken(savedToken)
      setDefaultMapStyle(savedStyle)
    }
    runHealthCheck()
  }, [])

  const runHealthCheck = async () => {
    setCheckingPing(true)
    const start = performance.now()
    try {
      await KanopiApi.getPublicAreas()
      const elapsed = Math.round(performance.now() - start)
      setPingMs(elapsed)
      setApiOnline(true)
    } catch {
      setApiOnline(false)
      setPingMs(null)
    } finally {
      setCheckingPing(false)
    }
  }

  const handleSaveMapCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      const clean = mapboxToken.trim()
      if (clean) localStorage.setItem('kanopi_mapbox_token', clean)
      else localStorage.removeItem('kanopi_mapbox_token')
      localStorage.setItem('kanopi_mapbox_style', defaultMapStyle)
    }
    setFeedback({
      type: 'success',
      message: 'Kredensial Mapbox GL & preferensi layer basemap berhasil disimpan! Peta di halaman /areas otomatis mengikuti konfigurasi ini.'
    })
  }

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhookOrderNo.trim()) return
    setSimulating(true)
    setFeedback(null)
    try {
      const res: any = await KanopiApi.simulatePaymentWebhook(webhookProvider, webhookOrderNo.trim())
      setFeedback({
        type: 'success',
        message: `Webhook ${webhookProvider.toUpperCase()} untuk Order "${webhookOrderNo}" berhasil diproses Backend (Status: ${res?.status || 'success'})!`
      })
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Gagal mengeksekusi simulasi webhook pembayaran.'
      })
    } finally {
      setSimulating(false)
    }
  }

  const hasValidPk = mapboxToken.trim().startsWith('pk.') && mapboxToken.trim().length > 20

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
      <Box>
        <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
          Kredensial Mapbox, Integrasi Backend & Sistem
        </Typography>
        <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
          Pusat konfigurasi token geospasial Mapbox GL JS, pemantauan kesehatan API NestJS + PostGIS, dan simulator webhook payment gateway.
        </Typography>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      <Grid container spacing={5}>
        {/* Left: Mapbox GL JS Credentials */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>Kredensial Peta Mapbox GL JS (WebGIS)</Typography>
                  <Chip
                    label={hasValidPk ? 'Token Mapbox pk.* Aktif' : 'Mode Hybrid WebGL Spec v8 (Tanpa Token)'}
                    size='small'
                    color={hasValidPk ? 'success' : 'info'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              }
            />
            <CardContent>
              <form onSubmit={handleSaveMapCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Typography variant='body2' sx={{ color: '#66756D' }}>
                  Masukkan <strong>Mapbox Public Access Token</strong> Anda untuk mengaktifkan vector tiles resmi Mapbox (<code>mapbox://styles/mapbox/satellite-streets-v12</code>). Jika dikosongkan, komponen WebGIS menggunakan citra satelit Esri World Imagery & OpenStreetMap di atas engine WebGL.
                </Typography>

                <TextField
                  fullWidth
                  label='Mapbox Public Access Token (pk.eyJ...)'
                  placeholder='pk.eyJ1Ijoia2Fub3Bpa2l0YSIsImEiOiJ...'
                  value={mapboxToken}
                  onChange={e => setMapboxToken(e.target.value)}
                  helperText='Disimpan di browser storage & digunakan langsung oleh modul /areas'
                />

                <TextField
                  select
                  fullWidth
                  label='Default Mapbox Style Layer'
                  value={defaultMapStyle}
                  onChange={e => setDefaultMapStyle(e.target.value)}
                >
                  <MenuItem value='satellite-streets-v12'>Satellite Streets v12 (Citra Satelit + Batas Wilayah)</MenuItem>
                  <MenuItem value='outdoors-v12'>Outdoors v12 (Topografi Kehutanan & Kontur)</MenuItem>
                  <MenuItem value='light-v11'>Light v11 (Minimalis Bersih untuk Data Spasial)</MenuItem>
                  <MenuItem value='dark-v11'>Dark v11 (Kontras Tinggi Monitoring Malam)</MenuItem>
                </TextField>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                  <Button
                    variant='outlined'
                    href='/areas'
                    startIcon={<i className='ri-map-2-line' />}
                    sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                  >
                    Buka Peta WebGIS
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600, px: 4 }}
                  >
                    Simpan Kredensial Map
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Backend Health & Payment Webhook Simulator */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* API & PostGIS Health Card */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>Status Koneksi Backend & PostGIS</Typography>
                    <Chip
                      label={apiOnline ? `ONLINE (${pingMs ?? 12} ms)` : 'OFFLINE'}
                      size='small'
                      color={apiOnline ? 'success' : 'error'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                }
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#F6FAF7', borderRadius: '10px', border: '1px solid #DFE7E0' }}>
                  <Typography variant='caption' sx={{ color: '#66756D', display: 'block' }}>Base URL Endpoint API:</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D', fontFamily: 'monospace' }}>
                    {getApiBaseUrl()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>
                    Engine Spasial: <strong>PostgreSQL 15 + PostGIS 3 (SRID 4326)</strong>
                  </Typography>
                  <Button
                    size='small'
                    variant='outlined'
                    disabled={checkingPing}
                    onClick={runHealthCheck}
                    sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                  >
                    {checkingPing ? 'Pinging...' : 'Test Ping API'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Webhook Simulator */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
              <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Simulator Webhook Payment Gateway</Typography>} />
              <CardContent>
                <Typography variant='caption' sx={{ color: '#66756D', display: 'block', mb: 2 }}>
                  Uji coba callback pelunasan order adopsi (<code>POST /v1/webhooks/payments/:provider</code>) untuk menerbitkan sertifikat otomatis:
                </Typography>
                <form onSubmit={handleSimulateWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <TextField
                    select
                    size='small'
                    fullWidth
                    label='Provider Payment Gateway'
                    value={webhookProvider}
                    onChange={e => setWebhookProvider(e.target.value as any)}
                  >
                    <MenuItem value='midtrans'>Midtrans (QRIS / Virtual Account)</MenuItem>
                    <MenuItem value='xendit'>Xendit (E-Wallet / Retail Outlet)</MenuItem>
                  </TextField>
                  <TextField
                    size='small'
                    fullWidth
                    label='Nomor Order Adopsi (Order No)'
                    value={webhookOrderNo}
                    onChange={e => setWebhookOrderNo(e.target.value)}
                    placeholder='Contoh: ORD-KNP-2026-0001'
                  />
                  <Divider />
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={simulating}
                    sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
                  >
                    {simulating ? 'Memproses Webhook...' : 'Trigger Settlement Webhook'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
