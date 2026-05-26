import './../styles/globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ShopKart — Online Shopping',
  description: 'Flipkart/Amazon-style e-commerce demo'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main className="container" style={{ minHeight: '70vh' }}>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
