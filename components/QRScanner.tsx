import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { QrCode, CheckCircle, XCircle, Camera, CameraOff } from 'lucide-react';
import { Student } from '../App';
import { toast } from 'sonner';

interface QRScannerProps {
  students: Student[];
  onMarkAttendance: (studentId: string, studentName: string, markedBy: string) => void;
  markedBy: string;
}

export default function QRScanner({ students, onMarkAttendance, markedBy }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; student?: Student } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // QR Code detection function using canvas and image data
  const detectQRCode = async (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR code detection simulation
    // In a real implementation, you would use a QR code detection library
    // For demo purposes, we'll simulate detection by checking if the user clicks
    return null;
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setHasPermission(true);
      setIsScanning(true);
      startScanning();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast.error('Camera access denied', {
        description: 'Please allow camera access to scan QR codes'
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const result = await detectQRCode(canvasRef.current, videoRef.current);
        if (result) {
          handleScan(result);
        }
      }
    }, 500); // Scan every 500ms
  };

  const handleScan = (qrCode: string) => {
    const student = students.find(s => s.qrCode === qrCode.trim());
    
    if (student) {
      onMarkAttendance(student.id, student.name, markedBy);
      setScanResult({
        success: true,
        message: `Attendance marked for ${student.name}`,
        student
      });
      toast.success(`Attendance marked for ${student.name}`, {
        description: `${student.schoolId} - ${student.class}`
      });
      
      // Stop scanning briefly after successful scan
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      // Resume scanning after 2 seconds
      setTimeout(() => {
        if (isScanning) {
          startScanning();
        }
      }, 2000);
    } else {
      setScanResult({
        success: false,
        message: 'Invalid QR code or student not found'
      });
      toast.error('Invalid QR code', {
        description: 'Student not found in the system'
      });
    }
    
    // Clear result after 3 seconds
    setTimeout(() => setScanResult(null), 3000);
  };

  // Manual scan simulation for testing (can be removed in production)
  const simulateScan = (student: Student) => {
    handleScan(student.qrCode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Use your camera to scan student QR codes for attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Controls */}
          <div className="flex justify-center gap-2">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                <CameraOff className="h-4 w-4" />
                Stop Camera
              </Button>
            )}
          </div>

          {/* Camera Permission Status */}
          {hasPermission === false && (
            <Card className="border-2 border-red-500 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-red-800">Camera access required</p>
                    <p className="text-sm text-red-600">
                      Please allow camera access in your browser to scan QR codes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera Preview */}
          {isScanning && (
            <div className="relative">
              <div className="relative mx-auto max-w-md">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-4 border-t-4 border-primary"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-4 border-t-4 border-primary"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-4 border-b-4 border-primary"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-4 border-b-4 border-primary"></div>
                </div>
                {/* Scanning indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                  Scanning for QR codes...
                </div>
              </div>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <Card className={`border-2 ${scanResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {scanResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className={scanResult.success ? 'text-green-800' : 'text-red-800'}>
                      {scanResult.message}
                    </p>
                    {scanResult.student && (
                      <p className="text-sm text-green-600">
                        {scanResult.student.schoolId} - {scanResult.student.class}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo: Quick Test Buttons (for development/testing) */}
          {isScanning && (
            <div>
              <h3 className="mb-3">Quick Test - Simulate Scanning</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {students.slice(0, 4).map((student) => (
                  <Button
                    key={student.id}
                    variant="outline"
                    className="justify-start p-3 h-auto"
                    onClick={() => simulateScan(student)}
                  >
                    <div className="text-left">
                      <div>{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.schoolId} - {student.class}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * These buttons simulate scanning for testing purposes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Click "Start Camera" to begin scanning QR codes</p>
          <p>• Point the camera at a student's QR code</p>
          <p>• The system will automatically detect and process QR codes</p>
          <p>• Each student can only be marked present once per day</p>
          <p>• Make sure the QR code is clearly visible in the camera frame</p>
        </CardContent>
      </Card>
    </div>
  );
}
