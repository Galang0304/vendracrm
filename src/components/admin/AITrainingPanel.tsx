'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AIProfile {
  companyName: string
  industry: string
  businessType: string
  learningScore: number
  lastUpdated?: string
  totalInteractions?: number
  topQuestions?: Array<{question: string, frequency: number}>
  insights: {
    strengths: string[]
    opportunities: string[]
    recommendations: string[]
  }
  products?: {
    categories: string[]
    topSellers: Array<{name: string, sales: number}>
  }
  operations?: {
    peakHours: string[]
    challenges: string[]
  }
}

export default function AITrainingPanel() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<AIProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [trained, setTrained] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkTrainingStatus()
  }, [])

  const checkTrainingStatus = async () => {
    try {
      const response = await fetch('/api/admin/ai-training')
      const data = await response.json()
      
      if (data.success) {
        setTrained(data.trained)
        if (data.profile) {
          setProfile(data.profile)
        }
        if (!data.trained) {
          setMessage(data.message)
        }
      }
    } catch (error) {
      console.error('Error checking AI training status:', error)
      setMessage('Error checking AI status')
    } finally {
      setLoading(false)
    }
  }

  const trainAI = async () => {
    setTraining(true)
    setMessage('🤖 AI sedang mempelajari bisnis Anda...')
    
    try {
      const response = await fetch('/api/admin/ai-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
        setTrained(true)
        setMessage(`✅ AI berhasil dilatih! Learning Score: ${data.profile.learningScore}/100`)
      } else {
        setMessage(`❌ Error: ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ Error training AI')
      console.error('Error:', error)
    } finally {
      setTraining(false)
    }
  }

  const getLearningScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getLearningScoreLabel = (score: number) => {
    if (score >= 80) return 'Expert'
    if (score >= 60) return 'Advanced'
    if (score >= 40) return 'Intermediate'
    if (score >= 20) return 'Beginner'
    return 'New'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">🧠 AI Business Intelligence</h3>
          <p className="text-gray-600">Train AI to understand your business better</p>
        </div>
        
        {profile && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLearningScoreColor(profile.learningScore)}`}>
            {getLearningScoreLabel(profile.learningScore)} ({profile.learningScore}/100)
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 
          message.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {!trained ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              🤖
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Belum Dilatih</h4>
            <p className="text-gray-600 mb-6">
              Latih AI untuk memahami bisnis Anda dan memberikan insights yang lebih personal
            </p>
          </div>
          
          <button
            onClick={trainAI}
            disabled={training}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {training ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Training AI...
              </>
            ) : (
              '🚀 Train AI Now'
            )}
          </button>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Business Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-1">Industry</h4>
              <p className="text-blue-700">{profile.industry}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-1">Business Type</h4>
              <p className="text-green-700">{profile.businessType}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-1">Interactions</h4>
              <p className="text-purple-700">{profile.totalInteractions || 0} conversations</p>
            </div>
          </div>

          {/* Business Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                💪 Business Strengths
              </h4>
              <ul className="space-y-2">
                {profile.insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                🎯 Growth Opportunities
              </h4>
              <ul className="space-y-2">
                {profile.insights.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    <span className="text-gray-700 text-sm">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              💡 AI Recommendations
            </h4>
            <div className="space-y-3">
              {profile.insights.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <p className="text-yellow-800 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Questions */}
          {profile.topQuestions && profile.topQuestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                ❓ Most Asked Questions
              </h4>
              <div className="space-y-2">
                {profile.topQuestions.map((q, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-gray-700 text-sm">{q.question}</span>
                    <span className="text-gray-500 text-xs bg-gray-200 px-2 py-1 rounded">
                      {q.frequency}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={trainAI}
              disabled={training}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded font-medium transition-colors text-sm"
            >
              {training ? 'Retraining...' : '🔄 Retrain AI'}
            </button>
            
            <button
              onClick={checkTrainingStatus}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors text-sm"
            >
              🔍 Check Status
            </button>
          </div>

          {profile.lastUpdated && (
            <p className="text-xs text-gray-500 text-center pt-2">
              Last updated: {new Date(profile.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <p>No training data available</p>
        </div>
      )}
    </div>
  )
}
