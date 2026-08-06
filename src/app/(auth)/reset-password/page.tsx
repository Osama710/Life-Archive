'use client'

import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAuth } from '@/context/AuthContext'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-success mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">We've sent a password reset link to {email}</p>
          <a href="/login" className="text-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">Reset Password</h1>
        <p className="text-gray-600 text-center mb-8">Enter your email to receive a reset link</p>

        <form onSubmit={handleReset} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-error text-sm bg-red-50 p-3 rounded">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Remember your password?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
