import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, Copy, QrCode } from 'lucide-react';
import ShareModal from './ShareModal';
import { generateQrCardImage } from '@/lib/qrCard';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const validateUrl = (input: string): boolean => {
    try {
      new URL(input);
      return true;
    } catch {
      // Try adding https:// if no protocol
      try {
        new URL(`https://${input}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const formatUrl = (input: string): string => {
    try {
      new URL(input);
      return input;
    } catch {
      return `https://${input}`;
    }
  };

  const generateQRCode = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., example.com or https://example.com).",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formattedUrl = formatUrl(url);
      const canvas = canvasRef.current;
      
      if (canvas) {
        await QRCode.toCanvas(canvas, formattedUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1a1a1a',
            light: '#ffffff'
          }
        });
        
        const dataUrl = canvas.toDataURL();
        setQrCodeUrl(dataUrl);
        
        toast({
          title: "QR Code Generated!",
          description: "Your QR code is ready to download or share.",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCard = async () => {
    if (!qrCodeUrl) return;
    try {
      const { blob, dataUrl } = await generateQrCardImage({
        qrDataUrl: qrCodeUrl,
        url: formatUrl(url),
        brandName: 'QR Flash Code',
      });

      // Prefer Blob/Object URL for better mobile support
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'qr-code-card.png';

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // iOS Safari often ignores download attr for data/object URLs
        window.open(dataUrl, '_blank');
      } else {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      toast({
        title: 'Card Downloaded',
        description: 'Your branded QR card is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to create the branded card. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      toast({
        title: "Copied to Clipboard",
        description: "QR code image copied successfully.",
      });
    } catch (error) {
      // Fallback: copy the URL
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "URL Copied",
          description: "URL copied to clipboard as fallback.",
        });
      } catch {
        toast({
          title: "Copy Failed",
          description: "Unable to copy to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateQRCode();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Section */}
      <Card className="card-elegant">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-primary animate-pulse-glow" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            QR Code Generator
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter any URL to generate a shareable QR code instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="Enter URL (e.g., example.com or https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-muted/50 border-border/50 focus:border-primary transition-colors"
            />
            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="bg-gradient-primary hover:opacity-90 transition-opacity px-8"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrCodeUrl && (
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl shadow-lg animate-float">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="Generated QR Code"
                      className="rounded-lg w-64 h-64"
                    />
                  ) : (
                    <canvas
                      ref={canvasRef}
                      className="rounded-lg"
                      style={{ display: 'none' }}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">QR Code for:</p>
                <p className="font-medium text-foreground break-all">{formatUrl(url)}</p>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={downloadQRCard}
                  variant="outline"
                  className="gap-2 border-border/50 hover:bg-muted/50"
                >
                  <Download className="h-4 w-4" />
                  Download Card
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="gap-2 border-border/50 hover:bg-muted/50"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  onClick={openShareModal}
                  variant="outline"
                  className="gap-2 border-border/50 hover:bg-muted/50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for QR generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        qrCodeUrl={qrCodeUrl}
        url={url}
      />
    </div>
  );
};

export default QRGenerator;