import React, { useState, useCallback } from 'react'
import { useZK } from '../context/ZKContext'

export function AgeInput() {
  const { birthDate, updateZKState, completeStep, keys } = useZK()
  const [date, setDate] = useState(birthDate ? {
    year: birthDate.year,
    month: birthDate.month,
    day: birthDate.day
  } : {
    year: '',
    month: '',
    day: ''
  })
  const [age, setAge] = useState(null)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState(null)

  const calculateAge = useCallback((birthYear, birthMonth, birthDay) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    let age = currentYear - birthYear

    // Adjust if birthday hasn't occurred this year
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--
    }

    return age
  }, [])

  const validateDate = useCallback((year, month, day) => {
    const errors = []

    // Check if all fields are filled
    if (!year || !month || !day) {
      return { isValid: false, errors: ['Please fill in all date fields'] }
    }

    // Convert to numbers
    const yearNum = parseInt(year, 10)
    const monthNum = parseInt(month, 10)
    const dayNum = parseInt(day, 10)

    // Validate ranges
    const currentYear = new Date().getFullYear()
    if (yearNum < 1900 || yearNum > currentYear - 5) {
      errors.push('Please enter a valid birth year')
    }

    if (monthNum < 1 || monthNum > 12) {
      errors.push('Please enter a valid month (1-12)')
    }

    if (dayNum < 1 || dayNum > 31) {
      errors.push('Please enter a valid day (1-31)')
    }

    // Check if date exists
    const testDate = new Date(yearNum, monthNum - 1, dayNum)
    if (testDate.getFullYear() !== yearNum || 
        testDate.getMonth() !== monthNum - 1 || 
        testDate.getDate() !== dayNum) {
      errors.push('This date does not exist')
    }

    // Check if date is not in the future
    const today = new Date()
    if (testDate > today) {
      errors.push('Birth date cannot be in the future')
    }

    return { isValid: errors.length === 0, errors }
  }, [])

  const handleDateChange = useCallback((field, value) => {
    // Only allow numeric input
    if (value && !/^\d+$/.test(value)) return

    const newDate = { ...date, [field]: value }
    setDate(newDate)

    // Validate when all fields have values
    if (newDate.year && newDate.month && newDate.day) {
      const validation = validateDate(newDate.year, newDate.month, newDate.day)
      
      if (validation.isValid) {
        const calculatedAge = calculateAge(
          parseInt(newDate.year, 10),
          parseInt(newDate.month, 10),
          parseInt(newDate.day, 10)
        )
        setAge(calculatedAge)
        setIsValid(true)
        setError(null)
      } else {
        setAge(null)
        setIsValid(false)
        setError(validation.errors[0])
      }
    } else {
      setAge(null)
      setIsValid(false)
      setError(null)
    }
  }, [date, validateDate, calculateAge])

  const handleSubmit = useCallback(() => {
    if (!isValid) return

    const birthData = {
      year: parseInt(date.year, 10),
      month: parseInt(date.month, 10),
      day: parseInt(date.day, 10),
      age,
      timestamp: Date.now()
    }

    updateZKState('birthDate', birthData)
    completeStep('age')
  }, [isValid, date, age, updateZKState, completeStep])

  const handleClear = useCallback(() => {
    setDate({ year: '', month: '', day: '' })
    setAge(null)
    setIsValid(false)
    setError(null)
    updateZKState('birthDate', null)
  }, [updateZKState])

  if (!keys) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Keys Required</h3>
        <p className="text-gray-500">Please generate your BabyJubJub keys first</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyber-primary mb-2">
          Enter Your Birth Date
        </h2>
        <p className="text-gray-400">
          This information stays private and is used only to generate your age proof
        </p>
      </div>

      {/* Date Input */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <input
              type="text"
              placeholder="1990"
              maxLength="4"
              value={date.year}
              onChange={(e) => handleDateChange('year', e.target.value)}
              className="cyber-input w-full text-center"
            />
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Month
            </label>
            <input
              type="text"
              placeholder="06"
              maxLength="2"
              value={date.month}
              onChange={(e) => handleDateChange('month', e.target.value)}
              className="cyber-input w-full text-center"
            />
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Day
            </label>
            <input
              type="text"
              placeholder="15"
              maxLength="2"
              value={date.day}
              onChange={(e) => handleDateChange('day', e.target.value)}
              className="cyber-input w-full text-center"
            />
          </div>
        </div>

        {/* Age Display */}
        {age !== null && (
          <div className={`p-4 rounded-lg border ${
            age >= 18 
              ? 'bg-neon-green/10 border-neon-green/30' 
              : 'bg-cyber-secondary/10 border-cyber-secondary/30'
          }`}>
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-1">Your calculated age</p>
              <p className={`text-2xl font-bold ${
                age >= 18 ? 'text-neon-green' : 'text-cyber-secondary'
              }`}>
                {age} years old
              </p>
              <p className={`text-sm mt-1 ${
                age >= 18 ? 'text-neon-green' : 'text-cyber-secondary'
              }`}>
                {age >= 18 ? '✓ Eligible for verification' : '✗ Must be 18 or older'}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClear}
            className="cyber-button flex-1 bg-gray-600/10 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || age < 18}
            className={`cyber-button flex-1 ${
              !isValid || age < 18 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-cyber-primary/10 border border-cyber-primary/30 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-cyber-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-cyber-primary font-medium text-sm">Privacy Protected</h4>
            <p className="text-cyber-primary/80 text-xs mt-1">
              Your exact birth date will never be revealed. Only the fact that you're over 18 will be proven.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Aid */}
      <div className="text-center text-gray-500 text-xs">
        <p>Enter your birth date in the format: YYYY MM DD</p>
        <p className="mt-1">Example: 1990 06 15 for June 15, 1990</p>
      </div>
    </div>
  )
} 