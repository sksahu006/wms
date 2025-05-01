export function formatToUTCISOString(date = new Date()): string {
    const pad = (num: number, size = 2) => String(num).padStart(size, '0');
  
    return (
      date.getUTCFullYear() + '-' +
      pad(date.getUTCMonth() + 1) + '-' +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) + ':' +
      pad(date.getUTCMinutes()) + ':' +
      pad(date.getUTCSeconds()) + '.' +
      pad(date.getUTCMilliseconds(), 3) + 'Z'
    );
  }
  