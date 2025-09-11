import React from 'react';
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
  Copy
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
      // First try to share the CARD image if the browser supports it
      if (navigator.share && navigator.canShare) {
        const { blob } = await generateQrCardImage({
          qrDataUrl: qrCodeUrl,
          url,
          brandName: 'QR Flash Code',
        });
        const file = new File([blob], 'qr-card.png', { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'QR Card',
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

      // Fallback to URL sharing for different platforms
      let shareUrl = '';
      const message = `Check out this QR card for: ${url}`;

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
          shareUrl = `mailto:?subject=QR Card&body=${encodeURIComponent(message)}`;
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
        description: 'Unable to share QR card. You can download it instead.',
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    try {
      const { blob, dataUrl } = await generateQrCardImage({
        qrDataUrl: qrCodeUrl,
        url,
        brandName: 'QR Flash Code',
      });

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'qr-code-card.png';
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
    } catch (e) {
      toast({
        title: 'Download Failed',
        description: 'Unable to create the QR card image.',
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
        const { blob } = await generateQrCardImage({
          qrDataUrl: qrCodeUrl,
          url,
          brandName: 'QR Flash Code',
        });
        const file = new File([blob], 'qr-card.png', { type: 'image/png' });

        if ((navigator as any).canShare?.({ files: [file] })) {
          await navigator.share({
            title: 'QR Card',
            text: `QR card for ${url}`,
            files: [file],
          });
        } else {
          // Fallback: share without file support
          await navigator.share({
            title: 'QR Card',
            text: `QR card for ${url}`,
            url: window.location.href,
          });
        }

        toast({
          title: 'Shared Successfully',
          description: 'QR card shared successfully.',
        });
      } catch (error) {
        console.log('Native sharing failed');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share QR Code
          </DialogTitle>
          <DialogDescription>
            Share your QR code on social platforms or download it
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Preview */}
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-lg shadow-sm border">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-32 h-32 rounded"
              />
            </div>
          </div>

          {/* URL Display */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">QR Code for:</p>
            <p className="font-medium text-sm break-all bg-muted px-3 py-2 rounded">
              {url}
            </p>
          </div>

          {/* Social Share Options */}
          <div>
            <h4 className="text-sm font-medium mb-3">Share on social platforms</h4>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  onClick={option.action}
                  className={`${option.color} text-white flex flex-col items-center gap-2 h-auto py-3`}
                  size="sm"
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-xs">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={downloadQRCode} variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={copyUrl} variant="outline" className="flex-1 gap-2">
              <Copy className="h-4 w-4" />
              Copy URL
            </Button>
            {navigator.share && (
              <Button onClick={shareNative} variant="outline" className="flex-1 gap-2">
                <Share className="h-4 w-4" />
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