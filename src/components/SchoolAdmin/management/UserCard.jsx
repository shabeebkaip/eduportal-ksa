import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Shield, User, MoreHorizontal, Link as LinkIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useToast } from '@/components/ui/use-toast.js';

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'inactive': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const formatRole = (role) => {
  return role.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const UserCard = ({ user, userType, onEdit, onDelete, onLink, onUnlink }) => {
  const { toast } = useToast();
  
  const handleCopyLink = () => {
    toast({
      title: '🚧 Feature in Progress',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const roles = user.role && Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []);

  return (
    <Card className="glass-effect border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 card-hover">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/50">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{user.name}</p>
            <Badge className={getStatusClass(user.status)}>{user.status}</Badge>
          </div>
          <p className="text-sm text-gray-400">{user.email || user.username || user.student_code}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {roles.map(role => <Badge key={role} variant="secondary" className="text-xs">{formatRole(role)}</Badge>)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-effect border-white/10 w-48" align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            {userType === 'teachers' && (
              <DropdownMenuItem onClick={handleCopyLink}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Login Link
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-400 focus:text-red-300">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

const AnimateItems = ({ items, ...props }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <UserCard user={item} {...props} />
        </motion.div>
      ))}
    </div>
  );
};

export default AnimateItems;
