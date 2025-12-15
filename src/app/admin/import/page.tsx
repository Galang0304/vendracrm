'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import MultipleCSVImport from '@/components/admin/MultipleCSVImport'
import SingleFileImport from '@/components/admin/SingleFileImport'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  FolderOpen,
  File
} from 'lucide-react'

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  transactions: string[]
  products: string[]
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('multiple')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [stores, setStores] = useState<any[]>([])
  const [selectedStore, setSelectedStore] = useState('')

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const stores = await response.json()
        console.log('Fetched stores:', stores) // Debug log
        setStores(stores || [])
        if (stores?.length > 0) {
          setSelectedStore(stores[0].id)
        }
      } else {
        console.error('Failed to fetch stores:', response.status)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      parseCSV(file)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim()) // Remove empty lines
      
      // Detect delimiter (comma, semicolon, or tab)
      const sampleLine = lines[0] || lines[1] || lines[2] || ''
      let delimiter = ','
      if (sampleLine.includes('\t')) {
        delimiter = '\t' // Tab delimited
      } else if (sampleLine.includes(';')) {
        delimiter = ';' // Semicolon delimited
      }
      console.log('🔍 Detected CSV delimiter:', delimiter === '\t' ? 'TAB' : delimiter)
      
      // Smart header detection
      let headerLine = ''
      let startIndex = 1
      
      // Check if first line contains "order no" (header indicator)
      if (lines[0] && lines[0].toLowerCase().includes('order no')) {
        headerLine = lines[0]
        startIndex = 1
      } else if (lines[2] && lines[2].toLowerCase().includes('order no')) {
        headerLine = lines[2]
        startIndex = 3
      } else {
        // Fallback to first line
        headerLine = lines[0]
        startIndex = 1
      }
      
      const headers = headerLine?.split(delimiter).map(h => h.trim().replace(/"/g, ''))
      console.log('🔍 Detected headers:', headers)
      
      if (!headers || headers.length < 5) {
        alert('Invalid CSV format - headers not found')
        return
      }

      const data = []
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        // ✅ IMPORT SEMUA BARIS - tidak ada filter panjang atau kosong
        // Sistem harus robust dan handle semua data user
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || '' // Kosong juga OK
        })
        data.push(row) // Push semua row tanpa kondisi
      }

      setCsvData(data)
      console.log(`Parsed ${data.length} CSV records:`, data.slice(0, 3))
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvData.length) {
      alert('No data to import')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/import/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          csvData,
          importType: 'transactions',
          storeId: selectedStore
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setImportResult(result.results)
        alert(`Import completed! ${result.results.success} records imported successfully.`)
      } else {
        alert(`Import failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed: Network error')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearData = () => {
    setCsvFile(null)
    setCsvData([])
    setImportResult(null)
    setShowPreview(false)
  }

  return (
    <DashboardLayout title="Import Data">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import CSV Data</h1>
          <p className="text-gray-600">Import transaction data from CSV files - single or multiple</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('multiple')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'multiple'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FolderOpen className="w-5 h-5 inline mr-2" />
                Multiple Files Import
              </button>
              <button
                onClick={() => setActiveTab('single')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'single'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <File className="w-5 h-5 inline mr-2" />
                Single File Import
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'multiple' ? (
              <MultipleCSVImport />
            ) : (
              <SingleFileImport 
                csvFile={csvFile}
                setCsvFile={setCsvFile}
                csvData={csvData}
                setCsvData={setCsvData}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                importResult={importResult}
                setImportResult={setImportResult}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                stores={stores}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                fetchStores={fetchStores}
                handleFileSelect={handleFileSelect}
                parseCSV={parseCSV}
                handleImport={handleImport}
                clearData={clearData}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
