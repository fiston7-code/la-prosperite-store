import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Grid principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Section À propos */}
          <div>
            <h3 className="font-bold text-foreground mb-4">La Prosperité Store</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votre boutique en ligne de confiance à Kinshasa. 
              Qualité, rapidité et service irréprochable.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/nouveautes" className="text-muted-foreground hover:text-primary transition-colors">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-muted-foreground hover:text-primary transition-colors">
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/livraison" className="text-muted-foreground hover:text-primary transition-colors">
                  Livraison
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Suivez-nous</h3>
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-background hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} La Prosperité Store. Tous droits réservés. 
            <span className="mx-2">•</span>
            Fait avec ❤️ à Kinshasa
          </p>
        </div>
      </div>
    </footer>
  );
}