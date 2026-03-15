import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
  className?: string
  vertical?: boolean
}

const NavLink = ({ href, children, onClick, className = '', vertical = false }: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = href === '/' 
    ? pathname === '/' 
    : pathname.split('/')[1] === href.split('/')[1]

  return (
    <Link
      className={cn(
        'nav-tab py-1.5',
        isActive ? 'opacity-100' : 'opacity-50',
        vertical 
          ? 'border-t-0 border-l-2 pl-3 hover:border-l-2' 
          : 'border-t-2',
        isActive && (vertical ? 'border-slate-500 dark:border-slate-500' : 'border-slate-500 dark:border-slate-500'),
        className
      )}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default NavLink
