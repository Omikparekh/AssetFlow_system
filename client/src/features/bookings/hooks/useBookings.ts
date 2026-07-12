import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bookingsService } from '../services/bookings.service';

export const useBookings = () => {
  const queryClient = useQueryClient();
  const createBooking = useMutation({
    mutationFn: bookingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Asset booked successfully');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Unable to book this asset'),
  });
  return { bookAsset: createBooking.mutate, isBooking: createBooking.isPending };
};

export const useBookingAvailability = (assetId: string, date: string) => useQuery({
  queryKey: ['bookings', 'availability', assetId, date],
  queryFn: () => bookingsService.getAvailability(assetId, date),
  enabled: Boolean(assetId && date),
});
