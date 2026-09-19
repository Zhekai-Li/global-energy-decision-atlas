import { useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'

export function HeaderDropdown({ id, label, children, wide = false }: { id: string; label: string; children: ReactNode | ((close: () => void) => ReactNode); wide?: boolean }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const closeAfterFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close()
  }
  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      close()
      event.currentTarget.querySelector<HTMLButtonElement>('.header-menu-trigger')?.focus()
    }
  }

  return <div className="header-dropdown nav-disclosure" onMouseEnter={() => setOpen(true)} onMouseLeave={() => { if (!window.matchMedia('(hover: none)').matches) close() }} onBlur={closeAfterFocus} onKeyDown={closeOnEscape}>
    <button className="header-menu-trigger" type="button" aria-expanded={open} aria-controls={`header-menu-${id}`} onClick={() => setOpen(true)}>{label}</button>
    {open && <div className={`header-menu${wide ? ' header-menu-wide' : ''}`} id={`header-menu-${id}`}>
      {typeof children === 'function' ? children(close) : children}
    </div>}
  </div>
}
