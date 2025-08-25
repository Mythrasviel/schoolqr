import React from 'react';
import { Card, CardContent } from './ui/card';

interface QRCodeDisplayProps {
  qrCode: string;
  studentName: string;
  schoolId: string;
}

export default function QRCodeDisplay({ qrCode, studentName, schoolId }: QRCodeDisplayProps) {
  // Generate QR code using an external API (for demo purposes)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-6 text-center space-y-4">
        <div className="space-y-2">
          <h3>{studentName}</h3>
          <p className="text-muted-foreground">School ID: {schoolId}</p>
        </div>
        
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border">
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${studentName}`}
              className="w-48 h-48"
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Scan this QR code to mark attendance</p>
          <p className="text-xs mt-1">Code: {qrCode}</p>
        </div>
      </CardContent>
    </Card>
  );
}
