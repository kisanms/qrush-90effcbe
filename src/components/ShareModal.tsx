import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  MessageCircle,
  Share,
  Download,
  Copy,
  Image,
  QrCode
} from 'lucide-react';
import { generateQrCardImage } from '@/lib/qrCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  url: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, qrCodeUrl, url }) => {
  const { toast } = useToast();
  const [shareMode, setShareMode] = useState<'card' | 'qr'>('card');

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: async () => {
        await shareToSocial('facebook');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: async () => {
        await shareToSocial('twitter');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: async () => {
        await shareToSocial('linkedin');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: async () => {
        await shareToSocial('whatsapp');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        await shareToSocial('email');
      }
    }
  ];

  const shareToSocial = async (platform: string) => {
    try {
      if (shareMode === 'card') {
        // Share branded card image
        if (navigator.share && navigator.canShare) {
          const { blob } = await generateQrCardImage({
            qrDataUrl: qrCodeUrl,
            url,
            brandName: 'QRUSH',
          });
          const file = new File([blob], 'qrush-card.png', { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'QRUSH QR Card',
              text: `QR card for ${url}`,
              files: [file],
            });

            toast({
              title: 'Shared Successfully',
              description: 'QR card image shared successfully.',
            });
            return;
          }
        }
      } else {
        // Share QR code only
        if (navigator.share && navigator.canShare) {
          const response = await fetch(qrCodeUrl);
          const blob = await response.blob();
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'QR Code',
              text: `QR code for ${url}`,
              files: [file],
            });

            toast({
              title: 'Shared Successfully',
              description: 'QR code shared successfully.',
            });
            return;
          }
        }
      }

      // Fallback to URL sharing for different platforms
      let shareUrl = '';
      const message = shareMode === 'card' 
        ? `Check out this QR card for: ${url}` 
        : `Check out this QR code for: ${url}`;

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(shareUrl, '_blank');
          break;
        case 'email':
          shareUrl = `mailto:?subject=${shareMode === 'card' ? 'QRUSH QR Card' : 'QR Code'}&body=${encodeURIComponent(message)}`;
          window.open(shareUrl);
          break;
      }

      toast({
        title: 'Opening Share Dialog',
        description: "Your device doesn't support direct image sharing. Opening platform share...",
      });
    } catch (error) {
      toast({
        title: 'Share Failed',
        description: `Unable to share ${shareMode === 'card' ? 'QR card' : 'QR code'}. You can download it instead.`,
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    try {
      if (shareMode === 'card') {
        const { blob, dataUrl } = await generateQrCardImage({
          qrDataUrl: qrCodeUrl,
          url,
          brandName: 'QRUSH',
        });

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'qrush-card.png';
        link.href = blobUrl;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          window.open(dataUrl, '_blank');
        } else {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

        toast({
          title: 'Download Started',
          description: 'Your QR card is being downloaded.',
        });
      } else {
        // Download QR code only
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = qrCodeUrl;
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          window.open(qrCodeUrl, '_blank');
        } else {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        toast({
          title: 'Download Started',
          description: 'Your QR code is being downloaded.',
        });
      }
    } catch (e) {
      toast({
        title: 'Download Failed',
        description: `Unable to download ${shareMode === 'card' ? 'QR card' : 'QR code'}.`,
        variant: 'destructive',
      });
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied",
        description: "URL copied to clipboard successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        if (shareMode === 'card') {
          const { blob } = await generateQrCardImage({
            qrDataUrl: qrCodeUrl,
            url,
            brandName: 'QRUSH',
          });
          const file = new File([blob], 'qrush-card.png', { type: 'image/png' });

          if ((navigator as any).canShare?.({ files: [file] })) {
            await navigator.share({
              title: 'QRUSH QR Card',
              text: `QR card for ${url}`,
              files: [file],
            });
          } else {
            await navigator.share({
              title: 'QRUSH QR Card',
              text: `QR card for ${url}`,
              url: window.location.href,
            });
          }
        } else {
          const response = await fetch(qrCodeUrl);
          const blob = await response.blob();
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });

          if ((navigator as any).canShare?.({ files: [file] })) {
            await navigator.share({
              title: 'QR Code',
              text: `QR code for ${url}`,
              files: [file],
            });
          } else {
            await navigator.share({
              title: 'QR Code',
              text: `QR code for ${url}`,
              url: window.location.href,
            });
          }
        }

        toast({
          title: 'Shared Successfully',
          description: `${shareMode === 'card' ? 'QR card' : 'QR code'} shared successfully.`,
        });
      } catch (error) {
        console.log('Native sharing failed');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share className="h-5 w-5" />
            Share QR Code
          </DialogTitle>
          <DialogDescription className="text-sm">
            Share your QR code on social platforms or download it
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Share Mode Toggle */}
          <div className="flex p-1 bg-muted rounded-lg">
            <Button
              variant={shareMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShareMode('card')}
              className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Branded Card</span>
              <span className="xs:hidden">Card</span>
            </Button>
            <Button
              variant={shareMode === 'qr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShareMode('qr')}
              className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">QR Only</span>
              <span className="xs:hidden">QR</span>
            </Button>
          </div>

          {/* QR Code Preview */}
          <div className="flex justify-center">
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm border">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded"
              />
            </div>
          </div>

          {/* URL Display */}
          <div className="text-center px-2">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              {shareMode === 'card' ? 'QR Card for:' : 'QR Code for:'}
            </p>
            <p className="font-medium text-xs sm:text-sm break-all bg-muted px-2 sm:px-3 py-2 rounded leading-relaxed">
              {url}
            </p>
          </div>

          {/* Social Share Options */}
          <div className="px-1">
            <h4 className="text-sm font-medium mb-3">Share on social platforms</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  onClick={option.action}
                  className={`${option.color} text-white flex flex-col items-center gap-1 sm:gap-2 h-auto py-2 sm:py-3`}
                  size="sm"
                >
                  <option.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs leading-tight">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={downloadQRCode} variant="outline" className="flex-1 gap-2 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Download {shareMode === 'card' ? 'Card' : 'QR'}
            </Button>
            <Button onClick={copyUrl} variant="outline" className="flex-1 gap-2 text-xs sm:text-sm">
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              Copy URL
            </Button>
            {navigator.share && (
              <Button onClick={shareNative} variant="outline" className="flex-1 gap-2 text-xs sm:text-sm">
                <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;