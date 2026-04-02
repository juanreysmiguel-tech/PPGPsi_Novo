import { useState, useMemo } from 'react'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------ */
/*  Column definition                                                  */
/* ------------------------------------------------------------------ */

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render?: (row: T) => React.ReactNode
  accessor?: (row: T) => string | number
}

/* ------------------------------------------------------------------ */
/*  DataTable                                                          */
/* ------------------------------------------------------------------ */

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  searchPlaceholder?: string
  searchFn?: (row: T, query: string) => boolean
  emptyMessage?: string
  className?: string
  pageSize?: number
}

export function DataTable<T>({
  columns, data, keyExtractor, onRowClick,
  searchPlaceholder = 'Buscar...', searchFn,
  emptyMessage = 'Nenhum registro encontrado.',
  className, pageSize = 15,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  // Filter
  const filtered = useMemo(() => {
    if (!search || !searchFn) return data
    const q = search.toLowerCase()
    return data.filter((row) => searchFn(row, q))
  }, [data, search, searchFn])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.accessor) return filtered
    return [...filtered].sort((a, b) => {
      const va = col.accessor!(a)
      const vb = col.accessor!(b)
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir, columns])

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white', className)}>
      {/* Search bar */}
      {searchFn && (
        <div className="border-b border-gray-100 px-4 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder={searchPlaceholder}
            className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                    col.className,
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-gray-50',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      {col.render ? col.render(row) : String((col.accessor?.(row)) ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
          <span className="text-gray-500">
            {sorted.length} registro{sorted.length !== 1 ? 's' : ''} | Pag. {page + 1}/{totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              Proximo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
