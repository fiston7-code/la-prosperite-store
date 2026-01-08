'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Accueil', href: '/' },
  { name: 'Boutique', href: '/shop' },
  { name: 'Nouveautés', href: '/nouveautes' },
  { name: 'Promotions', href: '/promotions' },
  { name: 'Contact', href: '/contact' },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Menu Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-bold">Menu</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`block px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border space-y-3">
          <Link
            href="/login"
            onClick={onClose}
            className="block w-full px-6 py-3 text-center bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/sign"
            onClick={onClose}
            className="block w-full px-6 py-3 text-center bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}