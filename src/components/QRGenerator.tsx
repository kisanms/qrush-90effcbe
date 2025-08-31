import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, Copy, QrCode } from 'lucide-react';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "Download Started",
      description: "Your QR code is being downloaded.",
    });
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

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for ${url}`,
          files: [file]
        });
        
        toast({
          title: "Shared Successfully",
          description: "QR code shared successfully.",
        });
      } catch (error) {
        copyToClipboard(); // Fallback to copy
      }
    } else {
      copyToClipboard(); // Fallback to copy
    }
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
                  <canvas
                    ref={canvasRef}
                    className="rounded-lg"
                    style={{ display: qrCodeUrl ? 'block' : 'none' }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">QR Code for:</p>
                <p className="font-medium text-foreground break-all">{formatUrl(url)}</p>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="gap-2 border-border/50 hover:bg-muted/50"
                >
                  <Download className="h-4 w-4" />
                  Download
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
                  onClick={shareQRCode}
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
    </div>
  );
};

export default QRGenerator;