'use client'

import { useState } from 'react'
import { TimelineItem } from '@/components/TimelineItem'
import { Input } from '@/components/Input'

const MOCK_SEARCH_RESULTS = [
  { id: '1', date: 'March 20, 2026', title: 'First Smile' },
  { id: '2', date: 'Feb 14, 2026', title: 'Smile in hospital' },
  { id: '3', date: 'Jan 5, 2026', title: 'Big smile moment' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof MOCK_SEARCH_RESULTS>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
    if (query.toLowerCase().includes('smile')) {
      setResults(MOCK_SEARCH_RESULTS)
    } else {
      setResults([])
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="mb-8">
        <Input
          type="search"
          placeholder="Search memories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </form>

      {searched && (
        <>
          <p className="text-gray-600 mb-6">
            {results.length} results found
            {query && ` for "${query}"`}
          </p>

          {results.length > 0 ? (
            <div>
              {results.map((result) => (
                <TimelineItem
                  key={result.id}
                  date={result.date}
                  title={result.title}
                  onClick={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No memories found</p>
              <p className="text-sm mt-2">Try different keywords</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
