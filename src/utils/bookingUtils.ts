/**
 * High-precision slot parsing & real-time auto-release calculations.
 * Helps determine if slot bookings are active, under a 1-hour grace period, or officially expired/released.
 */

export function getSlotEndDateTime(dateStr: string, slotStr: string): Date | null {
  if (!dateStr || !slotStr) return null;
  try {
    // Get the end time from range pattern: "09:00 AM - 09:30 AM" -> "09:30 AM"
    const parts = slotStr.split(' - ');
    const endTimeStr = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    
    const dateParts = dateStr.split('-');
    if (dateParts.length < 3) return null;
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    const timeMatch = endTimeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (err) {
    console.error("Failed to parse slot end time:", err);
    return null;
  }
}

export function getSlotStartDateTime(dateStr: string, slotStr: string): Date | null {
  if (!dateStr || !slotStr) return null;
  try {
    const parts = slotStr.split(' - ');
    const startTimeStr = parts[0].trim();
    
    const dateParts = dateStr.split('-');
    if (dateParts.length < 3) return null;
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    const timeMatch = startTimeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (err) {
    console.error("Failed to parse slot start time:", err);
    return null;
  }
}

export function isBookingExpired(dateStr: string, slotStr: string): boolean {
  const endDate = getSlotEndDateTime(dateStr, slotStr);
  if (!endDate) return false;
  
  const current = new Date();
  // Expired if current time is more than 1 hour past slot end time
  return current.getTime() > endDate.getTime() + 60 * 60 * 1000;
}

export interface SlotStatus {
  status: 'active' | 'expired' | 'upcoming';
  label: string;
  colorClass: string;
}

export function getSlotStatus(dateStr: string, slotStr: string): SlotStatus {
  const startDate = getSlotStartDateTime(dateStr, slotStr);
  const endDate = getSlotEndDateTime(dateStr, slotStr);
  
  if (!startDate || !endDate) {
    return {
      status: 'active',
      label: 'Scheduled',
      colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    };
  }
  
  const current = new Date();
  
  // 1. Upcoming block: not started yet
  if (current.getTime() < startDate.getTime()) {
    return {
      status: 'upcoming',
      label: 'Upcoming Slot',
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15'
    };
  }
  
  // 2. Expired: Current is more than 1 hour after the end date
  if (current.getTime() > endDate.getTime() + 60 * 60 * 1000) {
    return {
      status: 'expired',
      label: 'Expired & Released',
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/15'
    };
  }
  
  // 3. Grace period check: current is between end time and (end time + 1hr)
  if (current.getTime() > endDate.getTime()) {
    const elapsedMs = current.getTime() - endDate.getTime();
    const minutesLeft = Math.max(0, 60 - Math.floor(elapsedMs / 60000));
    return {
      status: 'active',
      label: `Grace Period: ${minutesLeft}m left`,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse'
    };
  }
  
  // 4. Currently running active slot
  return {
    status: 'active',
    label: 'Active Booking',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  };
}
