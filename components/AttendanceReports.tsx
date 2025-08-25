import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Student, AttendanceRecord } from '../App';

interface AttendanceReportsProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

export default function AttendanceReports({ students, attendanceRecords }: AttendanceReportsProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');

  const classes = [...new Set(students.map(s => s.class))];

  const filteredStudents = selectedClass === 'all' 
    ? students 
    : students.filter(s => s.class === selectedClass);

  const dateAttendance = attendanceRecords.filter(r => r.date === selectedDate);

  const getAttendanceForStudent = (studentId: string) => {
    return dateAttendance.find(r => r.studentId === studentId);
  };

  const presentCount = filteredStudents.filter(s => getAttendanceForStudent(s.id)).length;
  const attendanceRate = filteredStudents.length > 0 
    ? (presentCount / filteredStudents.length * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
          <CardDescription>View attendance statistics and records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl">{filteredStudents.length}</div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl text-green-600">{presentCount}</div>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl">{attendanceRate}%</div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Attendance - {selectedDate}</CardTitle>
          <CardDescription>
            {selectedClass === 'all' ? 'All Classes' : `Class ${selectedClass}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const attendance = getAttendanceForStudent(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.schoolId}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        attendance 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attendance ? 'Present' : 'Absent'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {attendance ? attendance.time : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
