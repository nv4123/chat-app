import { format, isToday, isYesterday, parseISO, differenceInDays } from 'date-fns';

export const formatTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = parseISO(timestamp);

    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      const daysDiff = differenceInDays(new Date(), date);
      return daysDiff <= 7
        ? format(date, 'EEEE')
        : format(date, 'dd/MM/yyyy');
    }
  } catch (error) {
    console.warn("Invalid timestamp in formatTime:", timestamp);
    return '';
  }
};

export const formatLastSeen = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = parseISO(timestamp);
    const now = new Date();

    if (isToday(date)) {
      return `today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `yesterday at ${format(date, 'HH:mm')}`;
    } else {
      const daysDiff = differenceInDays(now, date);
      return daysDiff <= 7
        ? `${format(date, 'EEEE')} at ${format(date, 'HH:mm')}`
        : format(date, 'dd/MM/yyyy HH:mm');
    }
  } catch (error) {
    console.warn("Invalid timestamp in formatLastSeen:", timestamp);
    return '';
  }
};

export const formatChatListTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = parseISO(timestamp);

    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'dd/MM/yy');
    }
  } catch (error) {
    console.warn("Invalid timestamp in formatChatListTime:", timestamp);
    return '';
  }
};
