
import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => (
  <div className="relative">
    <Bell className="h-6 w-6" />
    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
  </div>
);

export default NotificationBell;
