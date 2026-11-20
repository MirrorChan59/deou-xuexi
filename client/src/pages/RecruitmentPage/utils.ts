export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '待定';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '待定';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const getDaysLeft = (endDate: string): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  const diff = end.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getGradeStyle = (grade: string): string => {
  const base = 'rounded-full px-3 py-0.5 text-xs font-semibold';
  if (grade === '实习') {
    return `${base} bg-semantic-orange-bright/15 text-semantic-orange-bright`;
  }
  if (grade === '27届') {
    return `${base} bg-accent text-accent-foreground`;
  }
  if (grade === '28届') {
    return `${base} bg-primary/20 text-primary`;
  }
  if (grade === '29届') {
    return `${base} bg-primary/10 text-primary`;
  }
  return `${base} bg-muted text-muted-foreground`;
};
