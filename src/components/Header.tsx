import React from 'react';
import { QrCode, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <QrCode className="h-12 w-12 text-primary animate-pulse-glow" />
            <Zap className="h-4 w-4 text-qr-accent absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text leading-tight">
            QR Flash Code
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate beautiful QR codes instantly. Share any URL with style and ease.
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-qr-primary rounded-full animate-pulse"></div>
            Instant Generation
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-qr-secondary rounded-full animate-pulse"></div>
            Easy Sharing
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-qr-accent rounded-full animate-pulse"></div>
            High Quality
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;