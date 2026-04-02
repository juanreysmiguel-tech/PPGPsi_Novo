import { useState, useCallback } from 'react'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------ */
/*  Single accordion item                                              */
/* ------------------------------------------------------------------ */

interface AccordionItemProps {
  title: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ title, badge, defaultOpen = false, children, className }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('border-b border-gray-200 last:border-b-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge}
        </span>
        <svg
          className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', open && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Accordion container (single-open or multi-open)                    */
/* ------------------------------------------------------------------ */

interface AccordionSection {
  id: string
  title: string
  badge?: React.ReactNode
  content: React.ReactNode
}

interface AccordionProps {
  sections: AccordionSection[]
  singleOpen?: boolean
  className?: string
}

export function Accordion({ sections, singleOpen = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(singleOpen ? [] : prev)
      if (prev.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [singleOpen])

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden', className)}>
      {sections.map((section) => (
        <div key={section.id} className="border-b border-gray-200 last:border-b-0">
          <button
            type="button"
            onClick={() => toggle(section.id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              {section.title}
              {section.badge}
            </span>
            <svg
              className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', openIds.has(section.id) && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIds.has(section.id) && (
            <div className="px-4 pb-4 animate-fade-in">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
