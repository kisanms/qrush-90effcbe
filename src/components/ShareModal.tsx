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
      action: () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const shareUrl = `https://twitter.com/intent/tweet?text=Check out this QR code&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        const shareUrl = `https://wa.me/?text=Check out this link: ${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const shareUrl = `mailto:?subject=QR Code&body=Check out this link: ${url}`;
        window.open(shareUrl);
      }
    }
  ];

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