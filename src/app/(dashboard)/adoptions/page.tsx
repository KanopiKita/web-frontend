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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

interface TransactionRow {
  orderId: string
  adopterName: string
  adopterType: string
  package: string
  treeCode: string
  area: string
  amount: string
  gateway: string
  date: string
  status: 'PAID' | 'PENDING'
  certId: string
}

export default function AdoptionsPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [eligibleTrees, setEligibleTrees] = useState<any[]>([])
  const [transactions, setTransactions] = useState<TransactionRow[]>([
    {
      orderId: 'ORD-KNP-2026-0001',
      adopterName: 'Siti Lestari (Adopter)',
      adopterType: 'INDIVIDUAL',
      package: 'Paket Tunas Harapan (1 Pohon)',
      treeCode: 'KNP-MRG-004 (Mahoni)',
      area: 'Kawasan Restorasi Mangrove Muara Gembong',
      amount: 'Rp 50.000',
      gateway: 'Midtrans QRIS Gopay',
      date: '17 Nov 2026, 08:25',
      status: 'PAID',
      certId: 'CERT-KNP-2026-0001'
    }
  ])
  const [loading, setLoading] = useState(true)
  const [openCreateOrder, setOpenCreateOrder] = useState(false)
  const [selectedTreeId, setSelectedTreeId] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchAdoptionData = async () => {
    setLoading(true)
    try {
      const [pkgs, trees] = await Promise.all([
        KanopiApi.getAdoptionPackages().catch(() => []),
        KanopiApi.getPublicTrees().catch(() => [])
      ])

      if (Array.isArray(pkgs) && pkgs.length > 0) {
        setPackages(pkgs)
        setSelectedPackageId(pkgs[0].id)
      }

      if (Array.isArray(trees)) {
        const avail = trees.filter((t: any) => t.adoptionStatus === 'ELIGIBLE')
        setEligibleTrees(avail)
        if (avail[0]?.id) setSelectedTreeId(avail[0].id)
      }
    } catch (err) {
      console.error('Error fetching adoption data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdoptionData()
  }, [])

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTreeId || !selectedPackageId) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const order: any = await KanopiApi.createAdoptionOrder({
        tree_id: selectedTreeId,
        package_id: selectedPackageId,
        org_id: '00000000-0000-0000-0000-000000000001'
      })
      const treeObj = eligibleTrees.find(t => t.id === selectedTreeId)
      const pkgObj = packages.find(p => p.id === selectedPackageId)

      const newRow: TransactionRow = {
        orderId: order.orderNo || `ORD-${Date.now()}`,
        adopterName: 'Super Admin Kanopi (Order Backoffice)',
        adopterType: 'ORGANIZATION',
        package: pkgObj?.name || 'Paket Tunas Harapan',
        treeCode: `${treeObj?.treeCode || 'KNP-MRG'} (${treeObj?.species?.localName || 'Mangrove'})`,
        area: 'Kawasan Restorasi Mangrove Muara Gembong',
        amount: `Rp ${Number(pkgObj?.amount || 50000).toLocaleString('id-ID')}`,
        gateway: 'Midtrans Virtual Account',
        date: 'Baru saja',
        status: 'PENDING',
        certId: '-'
      }

      setTransactions(prev => [newRow, ...prev])
      setOpenCreateOrder(false)
      setFeedback({
        type: 'success',
        message: `Order adopsi ${newRow.orderId} berhasil dibuat di Backend (Status: RESERVED 30 Menit). Klik "Rekonsiliasi Bayar" untuk melunasi.`
      })
      await fetchAdoptionData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal membuat order adopsi baru.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReconcileOrder = async (orderId: string) => {
    setSubmitting(true)
    try {
      await KanopiApi.simulatePaymentWebhook('midtrans', orderId)
      setTransactions(prev =>
        prev.map(t =>
          t.orderId === orderId
            ? { ...t, status: 'PAID', certId: `CERT-${orderId.replace('ORD-', '')}` }
            : t
        )
      )
      setFeedback({
        type: 'success',
        message: `Order ${orderId} telah direkonsiliasi LUNAS (PAID) via Webhook Midtrans & Sertifikat diterbitkan!`
      })
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal merekonsiliasi pembayaran.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportFinanceCsv = () => {
    const headers = ['Order ID,Nama Adopter,Tipe,Paket,Pohon,Kawasan,Nominal,Gateway,Status,Sertifikat']
    const rows = transactions.map(
      t => `"${t.orderId}","${t.adopterName}","${t.adopterType}","${t.package}","${t.treeCode}","${t.area}","${t.amount}","${t.gateway}","${t.status}","${t.certId}"`
    )
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')))
    link.setAttribute('download', 'rekapitulasi-keuangan-adopsi-kanopi.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Transaksi, Rekonsiliasi & Katalog Paket Adopsi
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
            Katalog paket adopsi live backend (`/v1/adoption-packages`), pemesanan pohon, rekonsiliasi payment gateway, dan sertifikat digital.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='outlined'
            startIcon={<i className='ri-file-download-line' />}
            onClick={handleExportFinanceCsv}
            sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
          >
            Ekspor Rekap Keuangan (CSV)
          </Button>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={() => setOpenCreateOrder(true)}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
          >
            Buat Order Adopsi Baru
          </Button>
        </Box>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

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
                <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E' }}>
                        {pkg.name}
                      </Typography>
                      <Chip label={pkg.active ? 'Aktif' : 'Non-aktif'} size='small' color='success' sx={{ fontWeight: 600 }} />
                    </Box>
                    <Typography variant='h4' sx={{ color: '#176B4D', fontWeight: 800, my: 1 }}>
                      Rp {Number(pkg.amount).toLocaleString('id-ID')}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#66756D', display: 'block' }}>
                      Kuota Nama Sertifikat: {pkg.minNames} - {pkg.maxNames} Orang • Versi Polis: v{pkg.policyVersion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Orders Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Riwayat Order Adopsi & Rekonsiliasi</Typography>
              <Chip label={`${transactions.length} Transaksi Live BE`} size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 700 }} />
            </Box>
          }
        />
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order ID & Tanggal</TableCell>
                <TableCell>Nama Adopter</TableCell>
                <TableCell>Pohon & Kawasan</TableCell>
                <TableCell>Nominal & Gateway</TableCell>
                <TableCell>Status Pembayaran</TableCell>
                <TableCell align='right'>Sertifikat / Rekonsiliasi</TableCell>
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
                      <Chip label='Lunas (Verified)' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 700 }} />
                    ) : (
                      <Chip label='Menunggu Bayar (Reserved)' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    {order.status === 'PAID' ? (
                      <Button
                        variant='outlined'
                        size='small'
                        href='/carbon-certificates'
                        startIcon={<i className='ri-award-line' />}
                        sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                      >
                        {order.certId}
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        size='small'
                        disabled={submitting}
                        onClick={() => handleReconcileOrder(order.orderId)}
                        sx={{ bgcolor: '#D99A25', color: '#ffffff', fontWeight: 600 }}
                      >
                        Rekonsiliasi Bayar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Buat Order Adopsi Baru */}
      <Dialog open={openCreateOrder} onClose={() => setOpenCreateOrder(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateOrder}>
          <DialogTitle sx={{ fontWeight: 700 }}>Buat Order Adopsi Pohon Baru</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              fullWidth
              label='Pilih Pohon Siap Adopsi (Status: ELIGIBLE)'
              value={selectedTreeId}
              onChange={e => setSelectedTreeId(e.target.value)}
              required
            >
              {eligibleTrees.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.treeCode} — {t.species?.localName} ({t.species?.scientificName})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label='Pilih Paket Adopsi'
              value={selectedPackageId}
              onChange={e => setSelectedPackageId(e.target.value)}
              required
            >
              {packages.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} — Rp {Number(p.amount).toLocaleString('id-ID')}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateOrder(false)} sx={{ color: '#66756D' }}>Batal</Button>
            <Button
              type='submit'
              variant='contained'
              disabled={submitting || eligibleTrees.length === 0}
              sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
            >
              {submitting ? 'Memproses...' : 'Buat Order & Reservasi Pohon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
