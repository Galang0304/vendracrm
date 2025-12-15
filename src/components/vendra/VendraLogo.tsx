import Image from 'next/image'
import Link from 'next/link'

interface VendraLogoProps {
  width?: number
  height?: number
  className?: string
  variant?: 'default' | 'white' | 'dark'
  clickable?: boolean
  href?: string
}

export default function VendraLogo({ 
  width = 120, 
  height = 40, 
  className = '',
  variant = 'default',
  clickable = true,
  href = '/'
}: VendraLogoProps) {
  // Clean up className to avoid duplicates
  const cleanClassName = className.replace(/\bh-auto\b/g, '').trim()
  
  const logoClasses = `w-auto object-contain ${cleanClassName} ${
    variant === 'white' ? 'filter brightness-0 invert' : 
    variant === 'dark' ? 'filter brightness-0' : ''
  }`.replace(/\s+/g, ' ').trim()

  const LogoImage = () => (
    <Image
      src="/logo.png"
      alt="Vendra AI CRM"
      width={width}
      height={height}
      className={logoClasses}
      priority
    />
  )

  if (clickable) {
    return (
      <Link href={href} className="inline-block">
        <LogoImage />
      </Link>
    )
  }

  return <LogoImage />
}

// Preset components untuk kemudahan penggunaan
export function VendraLogoNav() {
  return <VendraLogo width={140} height={48} className="h-10" />
}

export function VendraLogoAuth() {
  return <VendraLogo width={160} height={56} className="h-14" clickable={false} />
}

export function VendraLogoFooter() {
  return <VendraLogo width={140} height={48} className="h-10" variant="white" />
}

export function VendraLogoSidebar() {
  return <VendraLogo width={160} height={56} className="h-12" />
}
