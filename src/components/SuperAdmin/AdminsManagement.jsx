import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const AdminsManagement = () => {
  const { admins, loading } = useData();
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "🚧 Feature in Progress",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admins Management</CardTitle>
            <CardDescription>View and manage all school administrators.</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Admins are created when a new school is added.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">Loading admins...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.schools?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{admin.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.status === 'Active' ? 'default' : 'destructive'}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={handleAction}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={handleAction}>Deactivate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={handleAction}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsManagement;