'use client'

import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  X,
  Plus,
  FolderOpen,
  BarChart3,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface CSVFile {
  id: string
  file: File
  data: any[]
  status: 'pending' | 'processing' | 'completed' | 'error'
  result?: ImportResult
  preview?: boolean
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  transactions: string[]
  products: string[]
  fileName: string
  processingTime: number
}

interface BatchImportResult {
  totalFiles: number
  completedFiles: number
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  results: ImportResult[]
  overallErrors: string[]
}

export default function MultipleCSVImport() {
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchResult, setBatchResult] = useState<BatchImportResult | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const stores = await response.json()
        setStores(stores || [])
        if (stores?.length > 0) {
          setSelectedStore(stores[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleMultipleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const csvFiles = files.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFiles.length === 0) {
      alert('Please select valid CSV files')
      return
    }

    const newCsvFiles: CSVFile[] = csvFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      data: [],
      status: 'pending',
      preview: false
    }))

    setCsvFiles(prev => [...prev, ...newCsvFiles])
    
    // Parse each CSV file
    newCsvFiles.forEach(csvFile => {
      parseCSV(csvFile.file, csvFile.id)
    })
  }

  const parseCSV = (file: File, fileId: string) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      // Detect delimiter
      const sampleLine = lines[0] || lines[1] || lines[2] || ''
      let delimiter = ','
      if (sampleLine.includes('\t')) {
        delimiter = '\t'
      } else if (sampleLine.includes(';')) {
        delimiter = ';'
      }
      
      // Smart header detection
      let headerLine = ''
      let startIndex = 1
      
      if (lines[0] && lines[0].toLowerCase().includes('order no')) {
        headerLine = lines[0]
        startIndex = 1
      } else if (lines[2] && lines[2].toLowerCase().includes('order no')) {
        headerLine = lines[2]
        startIndex = 3
      } else {
        headerLine = lines[0]
        startIndex = 1
      }
      
      const headers = headerLine?.split(delimiter).map(h => h.trim().replace(/"/g, ''))
      
      if (!headers || headers.length < 5) {
        updateFileStatus(fileId, 'error', [], { 
          success: 0, 
          failed: 0, 
          errors: ['Invalid CSV format - headers not found'], 
          transactions: [], 
          products: [],
          fileName: file.name,
          processingTime: 0
        })
        return
      }

      const data = []
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }

      updateFileData(fileId, data)
    }
    reader.readAsText(file)
  }

  const updateFileData = (fileId: string, data: any[]) => {
    setCsvFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, data } : file
    ))
  }

  const updateFileStatus = (fileId: string, status: CSVFile['status'], data?: any[], result?: ImportResult) => {
    setCsvFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status, data: data || file.data, result } : file
    ))
  }

  const togglePreview = (fileId: string) => {
    setCsvFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, preview: !file.preview } : file
    ))
  }

  const removeFile = (fileId: string) => {
    setCsvFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const clearAllFiles = () => {
    setCsvFiles([])
    setBatchResult(null)
    setProcessingProgress(0)
  }

  const handleBatchImport = async () => {
    if (csvFiles.length === 0) {
      alert('No files to import')
      return
    }

    if (!selectedStore) {
      alert('Please select a store')
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    
    const results: ImportResult[] = []
    const overallErrors: string[] = []
    let totalRecords = 0
    let successfulRecords = 0
    let failedRecords = 0

    try {
      for (let i = 0; i < csvFiles.length; i++) {
        const csvFile = csvFiles[i]
        
        if (csvFile.data.length === 0) {
          const errorResult: ImportResult = {
            success: 0,
            failed: 0,
            errors: ['No data to import'],
            transactions: [],
            products: [],
            fileName: csvFile.file.name,
            processingTime: 0
          }
          results.push(errorResult)
          updateFileStatus(csvFile.id, 'error', undefined, errorResult)
          continue
        }

        updateFileStatus(csvFile.id, 'processing')
        
        const startTime = Date.now()
        
        try {
          const response = await fetch('/api/admin/import/csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              csvData: csvFile.data,
              importType: 'transactions',
              storeId: selectedStore,
              companyId: stores.find(s => s.id === selectedStore)?.companyId, // Get companyId from selected store
              fileName: csvFile.file.name
            })
          })

          const result = await response.json()
          const processingTime = Date.now() - startTime

          if (response.ok) {
            const importResult: ImportResult = {
              ...result.results,
              fileName: csvFile.file.name,
              processingTime
            }
            
            results.push(importResult)
            totalRecords += importResult.success + importResult.failed
            successfulRecords += importResult.success
            failedRecords += importResult.failed
            
            updateFileStatus(csvFile.id, 'completed', undefined, importResult)
          } else {
            const errorResult: ImportResult = {
              success: 0,
              failed: csvFile.data.length,
              errors: [result.message || 'Import failed'],
              transactions: [],
              products: [],
              fileName: csvFile.file.name,
              processingTime
            }
            
            results.push(errorResult)
            failedRecords += csvFile.data.length
            overallErrors.push(`${csvFile.file.name}: ${result.message}`)
            
            updateFileStatus(csvFile.id, 'error', undefined, errorResult)
          }
        } catch (error) {
          const errorResult: ImportResult = {
            success: 0,
            failed: csvFile.data.length,
            errors: ['Network error'],
            transactions: [],
            products: [],
            fileName: csvFile.file.name,
            processingTime: Date.now() - startTime
          }
          
          results.push(errorResult)
          failedRecords += csvFile.data.length
          overallErrors.push(`${csvFile.file.name}: Network error`)
          
          updateFileStatus(csvFile.id, 'error', undefined, errorResult)
        }

        // Update progress
        setProcessingProgress(((i + 1) / csvFiles.length) * 100)
      }

      // Set batch result
      const batchResult: BatchImportResult = {
        totalFiles: csvFiles.length,
        completedFiles: results.filter(r => r.success > 0).length,
        totalRecords,
        successfulRecords,
        failedRecords,
        results,
        overallErrors
      }

      setBatchResult(batchResult)
      
      alert(`Batch import completed! ${successfulRecords}/${totalRecords} records imported successfully from ${csvFiles.length} files.`)
      
    } catch (error) {
      console.error('Batch import error:', error)
      alert('Batch import failed: Unexpected error')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(100)
    }
  }

  const getStatusIcon = (status: CSVFile['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: CSVFile['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-200 bg-gray-50'
      case 'processing':
        return 'border-blue-200 bg-blue-50'
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FolderOpen className="w-7 h-7 mr-3 text-blue-600" />
          Multiple CSV Import
        </h1>
        <p className="text-gray-600 mt-1">Import multiple CSV files simultaneously for batch processing</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Multiple CSV Files</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          <p className="text-gray-600 mb-4">
            Select multiple CSV files for batch import
          </p>
          
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={handleMultipleFileSelect}
            className="hidden"
            id="multiple-csv-upload"
          />
          
          <div className="flex justify-center space-x-3">
            <label
              htmlFor="multiple-csv-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add CSV Files
            </label>
            
            {csvFiles.length > 0 && (
              <button
                onClick={clearAllFiles}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Store Selection */}
        {csvFiles.length > 0 && (
          <div className="mt-6">
            <label htmlFor="store-select" className="block text-sm font-medium text-gray-700 mb-2">
              Target Store for All Imports
            </label>
            <select
              id="store-select"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stores.length === 0 ? (
                <option value="">Loading stores...</option>
              ) : (
                stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* Files List */}
      {csvFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Files Queue ({csvFiles.length} files)
            </h2>
            
            {!isProcessing && (
              <button
                onClick={handleBatchImport}
                disabled={!selectedStore || csvFiles.every(f => f.data.length === 0)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import All Files
              </button>
            )}
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Files...</span>
                <span className="text-sm text-gray-500">{Math.round(processingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                    processingProgress >= 100 ? 'w-full' :
                    processingProgress >= 75 ? 'w-3/4' :
                    processingProgress >= 50 ? 'w-1/2' :
                    processingProgress >= 25 ? 'w-1/4' : 'w-1/12'
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Files List */}
          <div className="space-y-4">
            {csvFiles.map((csvFile) => (
              <div key={csvFile.id} className={`border rounded-lg p-4 ${getStatusColor(csvFile.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(csvFile.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{csvFile.file.name}</h3>
                      <p className="text-sm text-gray-600">
                        {csvFile.data.length} records • {(csvFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {csvFile.data.length > 0 && (
                      <button
                        onClick={() => togglePreview(csvFile.id)}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {csvFile.preview ? 'Hide' : 'Preview'}
                      </button>
                    )}
                    
                    {csvFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(csvFile.id)}
                        className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* File Result */}
                {csvFile.result && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-green-600 font-medium">{csvFile.result.success}</p>
                        <p className="text-gray-500">Success</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-600 font-medium">{csvFile.result.failed}</p>
                        <p className="text-gray-500">Failed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-600 font-medium">{csvFile.result.processingTime}ms</p>
                        <p className="text-gray-500">Time</p>
                      </div>
                    </div>
                    
                    {csvFile.result.errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        <p className="font-medium">Errors:</p>
                        {csvFile.result.errors.slice(0, 3).map((error, index) => (
                          <p key={index}>• {error}</p>
                        ))}
                        {csvFile.result.errors.length > 3 && (
                          <p>... and {csvFile.result.errors.length - 3} more errors</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Preview */}
                {csvFile.preview && csvFile.data.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(csvFile.data[0]).slice(0, 6).map((key) => (
                            <th key={key} className="px-2 py-1 text-left font-medium text-gray-500 border-b">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvFile.data.slice(0, 3).map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.values(row).slice(0, 6).map((value: any, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 text-gray-900 border-r">
                                {String(value).substring(0, 15)}
                                {String(value).length > 15 && '...'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch Results */}
      {batchResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Batch Import Results
          </h2>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-900">{batchResult.totalFiles}</p>
              <p className="text-sm text-blue-600">Total Files</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-900">{batchResult.completedFiles}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-900">{batchResult.successfulRecords}</p>
              <p className="text-sm text-purple-600">Records Imported</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-900">{batchResult.failedRecords}</p>
              <p className="text-sm text-red-600">Failed Records</p>
            </div>
          </div>

          {/* Overall Errors */}
          {batchResult.overallErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Overall Errors
              </h3>
              <div className="space-y-1 text-sm text-red-700">
                {batchResult.overallErrors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          )}

          {/* Success Rate */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm text-gray-500">
                {batchResult.totalRecords > 0 
                  ? Math.round((batchResult.successfulRecords / batchResult.totalRecords) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-green-600 h-2 rounded-full ${
                  batchResult.totalRecords > 0 
                    ? (batchResult.successfulRecords / batchResult.totalRecords) * 100 >= 100 ? 'w-full' :
                      (batchResult.successfulRecords / batchResult.totalRecords) * 100 >= 75 ? 'w-3/4' :
                      (batchResult.successfulRecords / batchResult.totalRecords) * 100 >= 50 ? 'w-1/2' :
                      (batchResult.successfulRecords / batchResult.totalRecords) * 100 >= 25 ? 'w-1/4' : 'w-1/12'
                    : 'w-0'
                }`}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
