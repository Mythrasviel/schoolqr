import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { QrCode, CheckCircle, XCircle, Camera, CameraOff, RotateCcw, Keyboard, Scan } from 'lucide-react';
import { Student } from '../App';
import { toast } from 'sonner';

interface CombinedQRScannerProps {
  students: Student[];
  onMarkAttendance: (studentId: string, studentName: string, markedBy: string) => void;
  markedBy: string;
}

export default function CombinedQRScanner({ students, onMarkAttendance, markedBy }: CombinedQRScannerProps) {
  // Camera scanning state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTime = useRef<number>(0);

  // Manual input state
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState('');

  // Shared state
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; student?: Student } | null>(null);
  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');

  // QR Code pattern detection (simplified for demo)
  const detectQRCodeFromImageData = (imageData: ImageData): string | null => {
    // In production, you'd use a library like jsQR or @zxing/library
    // For demo purposes, this is a placeholder
    return null;
  };

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== 4) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrResult = detectQRCodeFromImageData(imageData);
    
    if (qrResult) {
      handleScan(qrResult);
    }
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setHasPermission(true);
      setIsScanning(true);
      startScanningLoop();
      
      toast.success('Camera started', {
        description: 'Point the camera at a QR code to scan'
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast.error('Camera access denied', {
        description: 'Please use manual input instead'
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
    setScanResult(null);
  };

  const startScanningLoop = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      processFrame();
    }, 100);
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleScan = (qrCode: string) => {
    const now = Date.now();
    
    // Prevent duplicate scans within 2 seconds
    if (now - lastScanTime.current < 2000) {
      return;
    }
    
    lastScanTime.current = now;
    
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

  // Manual input handlers
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    
    if (!manualCode.trim()) {
      setManualError('Please enter a QR code');
      return;
    }
    
    handleScan(manualCode);
    setManualCode('');
  };

  const handleManualInputChange = (value: string) => {
    setManualCode(value);
    if (manualError) {
      setManualError('');
    }
  };

  // Simulate scanning for testing (click on video)
  const handleVideoClick = () => {
    if (isScanning && students.length > 0) {
      const randomStudent = students[Math.floor(Math.random() * Math.min(3, students.length))];
      handleScan(randomStudent.qrCode);
    }
  };

  // Quick test function for manual input
  const fillTestCode = (student: Student) => {
    setManualCode(student.qrCode);
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
            Scan QR codes using camera or enter them manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(value: 'camera' | 'manual') => setActiveMode(value)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera Scanner
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Manual Input
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-6">
              {/* Camera Controls */}
              <div className="flex justify-center gap-2">
                {!isScanning ? (
                  <Button onClick={startCamera} className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={switchCamera} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Switch Camera
                    </Button>
                    <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                      <CameraOff className="h-4 w-4" />
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>

              {/* Camera Permission Status */}
              {hasPermission === false && (
                <Card className="border-2 border-destructive bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="text-destructive">Camera access denied</p>
                        <p className="text-sm text-muted-foreground">
                          Please allow camera access or use manual input instead
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
                      className="w-full h-80 bg-black rounded-lg object-cover cursor-pointer"
                      playsInline
                      muted
                      onClick={handleVideoClick}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanning frame overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-48 h-48 border-2 border-primary rounded-lg">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br"></div>
                        
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                          <div className="absolute w-full h-0.5 bg-primary animate-pulse" 
                               style={{
                                 animation: 'scan 2s linear infinite',
                                 background: 'linear-gradient(90deg, transparent, #030213, transparent)'
                               }}>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                      {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
                    </div>
                    
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm">
                      Scanning for QR codes...
                    </div>
                    
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      Tap to test
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Manual QR Code Entry
                  </CardTitle>
                  <CardDescription>
                    Enter the QR code manually if camera scanning is not available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qr-code">QR Code</Label>
                      <Input
                        id="qr-code"
                        value={manualCode}
                        onChange={(e) => handleManualInputChange(e.target.value)}
                        placeholder="Enter QR code (e.g., STU2024001-JOHN-DOE)"
                        className={manualError ? 'border-destructive' : ''}
                      />
                      {manualError && (
                        <p className="text-destructive text-sm">{manualError}</p>
                      )}
                      <p className="text-muted-foreground text-sm">
                        Enter the complete QR code as shown on the student's device
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Scan className="h-4 w-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </form>

                  {/* Quick Test Buttons for Manual Input */}
                  <div className="mt-6">
                    <h4 className="mb-3">Quick Test - Student QR Codes</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {students.slice(0, 4).map((student) => (
                        <Button
                          key={student.id}
                          variant="outline"
                          className="justify-start p-3 h-auto"
                          onClick={() => fillTestCode(student)}
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
                      * Click to auto-fill QR code for testing
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Scan Result - Shared between both modes */}
          {scanResult && (
            <Card className={`border-2 mt-6 ${scanResult.success ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {scanResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className={scanResult.success ? 'text-green-800' : 'text-destructive'}>
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
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2">Camera Scanner:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Point the camera at a student's QR code</p>
              <p>• Ensure good lighting and hold the device steady</p>
              <p>• Keep QR codes within the scanning frame</p>
              <p>• Use "Switch Camera" to toggle between front and back cameras</p>
            </div>
          </div>
          
          <div>
            <h4 className="mb-2">Manual Input:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Use when camera is not available or not working</p>
              <p>• Ask students to read their QR code aloud</p>
              <p>• Enter the complete code exactly as shown</p>
              <p>• QR codes are in format: SCHOOLID-STUDENT-NAME</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
