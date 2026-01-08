'use client';

import { useState, useEffect } from 'react';
import Logo from './Logo';
import Navigation from './Navigation';
import MobileMenu from '../ui/MobileMenu';
import CartButton from '../ui/CartButton';
import { Search, Menu } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-background/60 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex shrink-0">
              <Logo />
            </div>

            {/* Navigation Desktop - Centré comme Apple */}
            <div className="hidden lg:flex flex-1 justify-center">
              <Navigation />
            </div>

            {/* Actions Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Barre de recherche */}
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <Search className="w-5 h-5 text-foreground" />
              </button>

              {/* Panier avec badge animé */}
              <CartButton />
            </div>

            {/* Menu Mobile Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <CartButton />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Menu className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer pour compenser le header fixe */}
      <div className="h-16" />

      {/* Menu Mobile */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}