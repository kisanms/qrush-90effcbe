import React from 'react';
import Header from '@/components/Header';
import QRGenerator from '@/components/QRGenerator';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4">
        <Header />
        
        <main className="py-8">
          <QRGenerator />
        </main>
        
        <Features />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
