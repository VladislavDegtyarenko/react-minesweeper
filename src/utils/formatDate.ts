const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const formatDate = (date: Date) => {
  return dateFormatter.format(date);
};
