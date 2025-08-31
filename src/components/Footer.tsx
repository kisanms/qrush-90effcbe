import React from 'react';
import { Heart, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-8 px-4 mt-16 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span className="text-sm">
            Made with{' '}
            <Heart className="h-4 w-4 text-red-500 inline mx-1" />
            for the web
          </span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Generate QR codes instantly • Privacy-focused • No data stored</p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} QR Flash Code. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;