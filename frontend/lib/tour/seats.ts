export type SeatsLevel = 'available' | 'low' | 'critical' | 'sold-out';

const getSeatsLevel = (free: number, total: number): SeatsLevel => {
  if (free === 0) return 'sold-out';

  const freePercentSeats = free / total;

  if (freePercentSeats <= 0.2) return 'critical';
  if (freePercentSeats <= 0.5) return 'low';

  return 'available'
}

export default getSeatsLevel;