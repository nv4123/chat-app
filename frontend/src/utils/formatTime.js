import { format, isToday, isYesterday, parseISO, differenceInDays } from 'date-fns';

export const formatTime = (timestamp) => {
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff <= 7) {
      return format(date, 'EEEE'); // e.g. "Monday"
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  }
};

export const formatLastSeen = (timestamp) => {
  const date = parseISO(timestamp);
  const now = new Date();
  
  if (isToday(date)) {
    return `today at ${format(date, 'HH:mm')}`;
  } else if (isYesterday(date)) {
    return `yesterday at ${format(date, 'HH:mm')}`;
  } else {
    const daysDiff = differenceInDays(now, date);
    if (daysDiff <= 7) {
      return `${format(date, 'EEEE')} at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm');
    }
  }
};

export const formatChatListTime = (timestamp) => {
  const date = parseISO(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'dd/MM/yy');
  }
};
