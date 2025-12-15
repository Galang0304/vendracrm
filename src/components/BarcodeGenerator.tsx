'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { Download, Barcode } from 'lucide-react'

interface BarcodeGeneratorProps {
  value: string
  productName?: string
  showDownload?: boolean
  width?: number
  height?: number
}

export default function BarcodeGenerator({ 
  value, 
  productName = '', 
  showDownload = true,
  width = 2,
  height = 100 
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (value && value.length >= 8) {
      generateBarcode()
    }
  }, [value, width, height])

  const generateBarcode = () => {
    if (!canvasRef.current || !svgRef.current) return

    try {
      // Generate barcode on canvas for download
      JsBarcode(canvasRef.current, value, {
        format: "EAN13",
        width: width,
        height: height,
        displayValue: true,
        fontSize: 14,
        textMargin: 5,
        background: "#ffffff",
        lineColor: "#000000"
      })

      // Generate barcode on SVG for display
      JsBarcode(svgRef.current, value, {
        format: "EAN13",
        width: width,
        height: height,
        displayValue: true,
        fontSize: 14,
        textMargin: 5,
        background: "#ffffff",
        lineColor: "#000000"
      })
    } catch (error) {
      console.error('Error generating barcode:', error)
    }
  }

  const downloadBarcode = () => {
    if (!canvasRef.current) return

    try {
      // Create a new canvas with product name
      const downloadCanvas = document.createElement('canvas')
      const ctx = downloadCanvas.getContext('2d')
      if (!ctx) return

      const barcodeCanvas = canvasRef.current
      const padding = 20
      const nameHeight = productName ? 30 : 0
      
      downloadCanvas.width = barcodeCanvas.width + (padding * 2)
      downloadCanvas.height = barcodeCanvas.height + (padding * 2) + nameHeight

      // Fill background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height)

      // Add product name if provided
      if (productName) {
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          productName, 
          downloadCanvas.width / 2, 
          padding + 20
        )
      }

      // Draw barcode
      ctx.drawImage(
        barcodeCanvas, 
        padding, 
        padding + nameHeight
      )

      // Download
      const link = document.createElement('a')
      link.download = `barcode-${value}-${productName || 'product'}.png`
      link.href = downloadCanvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error downloading barcode:', error)
      alert('Gagal mendownload barcode')
    }
  }

  const downloadBarcodeLabel = () => {
    if (!canvasRef.current) return

    try {
      // Create label-sized canvas (standard label: 4cm x 2cm at 300 DPI)
      const labelCanvas = document.createElement('canvas')
      const ctx = labelCanvas.getContext('2d')
      if (!ctx) return

      // Label dimensions (4cm x 2cm at 300 DPI)
      const labelWidth = 472  // 4cm at 300 DPI
      const labelHeight = 236 // 2cm at 300 DPI
      
      labelCanvas.width = labelWidth
      labelCanvas.height = labelHeight

      // Fill background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, labelWidth, labelHeight)

      // Generate barcode for label
      const tempCanvas = document.createElement('canvas')
      JsBarcode(tempCanvas, value, {
        format: "EAN13",
        width: 1.5,
        height: 60,
        displayValue: true,
        fontSize: 10,
        textMargin: 3,
        background: "#ffffff",
        lineColor: "#000000"
      })

      // Center barcode on label
      const barcodeX = (labelWidth - tempCanvas.width) / 2
      const barcodeY = (labelHeight - tempCanvas.height) / 2

      ctx.drawImage(tempCanvas, barcodeX, barcodeY)

      // Add product name if provided
      if (productName) {
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 8px Arial'
        ctx.textAlign = 'center'
        
        // Truncate long names
        let displayName = productName
        if (productName.length > 30) {
          displayName = productName.substring(0, 27) + '...'
        }
        
        ctx.fillText(
          displayName, 
          labelWidth / 2, 
          barcodeY - 10
        )
      }

      // Download
      const link = document.createElement('a')
      link.download = `barcode-label-${value}-${productName || 'product'}.png`
      link.href = labelCanvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error downloading barcode label:', error)
      alert('Gagal mendownload label barcode')
    }
  }

  if (!value || value.length < 8) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Barcode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Masukkan barcode untuk melihat preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barcode Display */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <svg ref={svgRef} className="mx-auto"></svg>
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
      </div>

      {/* Download Buttons */}
      {showDownload && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={downloadBarcode}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Barcode
          </button>
          <button
            onClick={downloadBarcodeLabel}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Label
          </button>
        </div>
      )}
    </div>
  )
}
