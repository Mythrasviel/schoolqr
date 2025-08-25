import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, QrCode, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { User, AttendanceRecord } from '../App';
import QRCodeDisplay from './QRCodeDisplay';

interface StudentDashboardProps {
  user: User;
  attendanceRecords: AttendanceRecord[];
  onLogout: () => void;
}

export default function StudentDashboard({
  user,
  attendanceRecords,
  onLogout
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('qr-code');

  // Calculate attendance statistics
  const totalDays = 30; // Mock total school days
  const presentDays = attendanceRecords.length;
  const attendancePercentage = ((presentDays / totalDays) * 100).toFixed(1);

  // Check if present today
  const today = new Date().toISOString().split('T')[0];
  const isPresentToday = attendanceRecords.some(record => record.date === today);

  // Get recent attendance (last 10 records)
  const recentAttendance = attendanceRecords.slice(-10).reverse();

  // Extract school ID from QR code (format: SCHOOLID-NAME)
  const schoolId = user.qrCode ? user.qrCode.split('-')[0] : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1>Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qr-code">My QR Code</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
          </TabsList>

          <TabsContent value="qr-code">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Your Attendance QR Code
                </CardTitle>
                <CardDescription>
                  Show this QR code to your teacher for attendance marking
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {user.qrCode && (
                  <QRCodeDisplay
                    qrCode={user.qrCode}
                    studentName={user.name}
                    schoolId={schoolId}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Today's Status */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Status</CardTitle>
                <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  {isPresentToday ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-green-600">Present</p>
                        <p className="text-sm text-muted-foreground">
                          Marked at {attendanceRecords.find(r => r.date === today)?.time}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="text-red-600">Not Marked</p>
                        <p className="text-sm text-muted-foreground">
                          Show your QR code to mark attendance
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Days Present</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{presentDays}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {totalDays} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{attendancePercentage}%</div>
                  <p className="text-xs text-muted-foreground">
                    Overall attendance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Days Absent</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{totalDays - presentDays}</div>
                  <p className="text-xs text-muted-foreground">
                    Missed days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Student Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>My Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">School ID</p>
                    <p>{schoolId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">QR Code</p>
                    <p className="text-xs bg-muted p-1 rounded">{user.qrCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Your recent attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p>{new Date(record.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Marked at {record.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                  ))}
                  {recentAttendance.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No attendance records yet</p>
                      <p className="text-sm">Show your QR code to teachers to mark attendance</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
