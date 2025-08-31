import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Smartphone, Zap, Shield, Palette } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Generation",
      description: "Generate QR codes in milliseconds with our optimized algorithm"
    },
    {
      icon: Download,
      title: "Easy Download",
      description: "Download your QR codes as high-quality PNG images"
    },
    {
      icon: Share2,
      title: "Quick Sharing",
      description: "Share QR codes directly or copy them to your clipboard"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Perfect responsive design that works on all devices"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "All QR codes are generated locally - your data stays private"
    },
    {
      icon: Palette,
      title: "Clean Design",
      description: "Beautiful, modern interface with elegant animations"
    }
  ];

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Why Choose QR Flash Code?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the fastest and most elegant way to generate QR codes for any URL
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-elegant hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-10 w-10 text-primary animate-float" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;