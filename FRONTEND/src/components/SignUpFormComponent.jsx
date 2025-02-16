// IMAGE-CONVERSATIONAL-CHATBOT is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// IMAGE-CONVERSATIONAL-CHATBOT is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with IMAGE-CONVERSATIONAL-CHATBOT.  If not, see <https://www.gnu.org/licenses/>.

import React, { useState } from 'react'
import { AlertCircle } from "lucide-react"
import PopupComponent from './PopupComponent'

const BASE_URL = "http://127.0.0.1:8000"

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isVerificationMailSent, setVerificationMailSent] = useState(false)

  const navigate = (path) => {
    // This is a placeholder for navigation functionality
    console.log(`Navigating to: ${path}`)
  }

  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]).{8,}$/

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setIsLoading(true)

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    if (!passwordPattern.test(password)) {
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters long.')
      } else if (!/[A-Z]/.test(password)) {
        setPasswordError('Password must contain at least one uppercase letter.')
      } else if (!/\d/.test(password)) {
        setPasswordError('Password must contain at least one digit.')
      } else if (!/[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]/.test(password)) {
        setPasswordError('Password must contain at least one special character.')
      }
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/v1/signup`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Signup successful', data)
        setVerificationMailSent(true)
        PopupComponent(contentType = 'Email Verification', content = 'Signup successful. Please login to continue.', redirectPath='/login')
        navigate('/login')
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {passwordError && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={20} />
                <p>{passwordError}</p>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Log in
              </a>
            </p>
          </div>
          {isVerificationMailSent && <PopupComponent content={"Verification Mail"} contentType={"Verification Link Sent To Mail"} redirectPath={"/login"}/>}
        </div>
      </div>
    </div>
  )
}
