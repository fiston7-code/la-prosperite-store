'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Accueil', href: '/' },
  { name: 'Boutique', href: '/boutique' },
  { name: 'Nouveautés', href: '/nouveautes' },
  { name: 'Promotions', href: '/promotions' },
  { name: 'Contact', href: '/contact' },
   { name: 'login/sign-up', href: '/auth' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.name}
            
            {/* Indicateur actif - Style Apple */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}