'use client'

import React, { useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Trash2
} from 'lucide-react'

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  transactions: string[]
  products: string[]
}

interface SingleFileImportProps {
  csvFile: File | null
  setCsvFile: (file: File | null) => void
  csvData: any[]
  setCsvData: (data: any[]) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  importResult: ImportResult | null
  setImportResult: (result: ImportResult | null) => void
  showPreview: boolean
  setShowPreview: (show: boolean) => void
  stores: any[]
  selectedStore: string
  setSelectedStore: (store: string) => void
  fetchStores: () => void
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  parseCSV: (file: File) => void
  handleImport: () => void
  clearData: () => void
}

export default function SingleFileImport({
  csvFile,
  setCsvFile,
  csvData,
  setCsvData,
  isProcessing,
  setIsProcessing,
  importResult,
  setImportResult,
  showPreview,
  setShowPreview,
  stores,
  selectedStore,
  setSelectedStore,
  fetchStores,
  handleFileSelect,
  parseCSV,
  handleImport,
  clearData
}: SingleFileImportProps) {

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Single CSV File</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          {!csvFile ? (
            <>
              <p className="text-gray-600 mb-4">
                Select CSV file with transaction data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose CSV File
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-6 w-6 text-green-600" />
                <span className="text-gray-900 font-medium">{csvFile.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                {csvData.length} records found
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Preview'}
                </button>
                <button
                  onClick={clearData}
                  className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CSV Preview */}
        {showPreview && csvData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Data Preview (First 5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(csvData[0]).slice(0, 8).map((key) => (
                      <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).slice(0, 8).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 border-r">
                          {String(value).substring(0, 20)}
                          {String(value).length > 20 && '...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Store Selection & Import Button */}
        {csvData.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Store Selection */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <label htmlFor="store-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Toko untuk Import
                </label>
                <select
                  id="store-select"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {stores.length === 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    <p>Tidak ada toko ditemukan.</p>
                    <a 
                      href="/admin/stores" 
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Buat toko terlebih dahulu →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Import Button */}
            <div className="flex justify-center">
              <button
                onClick={handleImport}
                disabled={isProcessing || !selectedStore}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {csvData.length} Records ke {stores.find(s => s.id === selectedStore)?.name}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Success</p>
                  <p className="text-2xl font-bold text-green-900">{importResult.success}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{importResult.failed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{importResult.success + importResult.failed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-2">Errors</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700 mb-1">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Transactions Created</h3>
              <p className="text-sm text-gray-600">{importResult.transactions.length} transactions imported</p>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Products Created</h3>
              <p className="text-sm text-gray-600">{importResult.products.length} products created/updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Field Mapping Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">CSV Field Mapping</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Transaction Fields:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>order no</strong> → Transaction Number</li>
              <li>• <strong>order time</strong> → Transaction Date</li>
              <li>• <strong>currency</strong> → Currency (IDR)</li>
              <li>• <strong>payment type</strong> → Payment Method</li>
              <li>• <strong>tax amount</strong> → Tax Amount</li>
              <li>• <strong>discount amount</strong> → Discount</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Product Fields:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>item name</strong> → Product Name</li>
              <li>• <strong>item sku</strong> → Product SKU</li>
              <li>• <strong>brand</strong> → Product Brand</li>
              <li>• <strong>item group</strong> → Category</li>
              <li>• <strong>cost perunit</strong> → Product Cost</li>
              <li>• <strong>price</strong> → Product Price</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
