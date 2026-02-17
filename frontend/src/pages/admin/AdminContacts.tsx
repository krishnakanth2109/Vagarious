import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, Phone, Calendar } from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  submittedAt: string;
}

const AdminContacts = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/contact"); // Ensure this matches your backend URL
        
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (err: any) {
        console.error(err);
        setError("Could not load messages. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout title="Contact Messages">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Inquiries</h2>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            Total: {messages.length}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No contact messages found.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User Details</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-[40%]">Message</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg._id} className="hover:bg-slate-50">
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground align-top pt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(msg.submittedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-gray-900">{msg.name}</span>
                            <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <Mail className="w-3 h-3" /> {msg.email}
                            </a>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" /> {msg.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-700 align-top pt-4">
                          {msg.subject}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 align-top pt-4">
                          <div className="max-h-24 overflow-y-auto pr-2">
                            {msg.message}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          <Badge
                            className={
                              msg.status === "New"
                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {msg.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;