import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingAvailability, useBookings } from '../hooks/useBookings';

const timeSlots = Array.from({ length: 24 }, (_, hour) => {
  const formatHour = (value: number) => new Intl.DateTimeFormat('en', {
    hour: 'numeric', hour12: true,
  }).format(new Date(2000, 0, 1, value));
  return { value: String(hour), label: `${formatHour(hour)} – ${formatHour((hour + 1) % 24)}` };
});

interface FormData { date: string; timeSlot: string; purpose?: string }

export const BookAssetDialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; assetId: string; assetName: string }> = ({ open, onOpenChange, assetId, assetName }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: { date: new Date().toISOString().slice(0, 10), timeSlot: '' },
  });
  const { bookAsset, isBooking } = useBookings();
  const bookingDate = watch('date');
  const { data: availability, isLoading: isLoadingAvailability } = useBookingAvailability(assetId, bookingDate);
  const availableSlots = timeSlots.filter((slot) => !availability?.unavailableHours.includes(Number(slot.value)));
  const submit = (data: FormData) => {
    const startTime = new Date(`${data.date}T00:00:00`);
    startTime.setHours(Number(data.timeSlot), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    bookAsset({ assetId, startTime: startTime.toISOString(), endTime: endTime.toISOString(), purpose: data.purpose }, {
      onSuccess: () => { reset(); onOpenChange(false); },
    });
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>Book {assetName}</DialogTitle><DialogDescription>Choose when you need this available asset.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="date">Booking date</Label><Input id="date" type="date" required {...register('date')} onChange={(event) => { setValue('date', event.target.value); setValue('timeSlot', ''); }} /></div>
        <div className="space-y-2"><Label htmlFor="timeSlot">Available time slot</Label><select id="timeSlot" required disabled={isLoadingAvailability} {...register('timeSlot')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"><option value="">{isLoadingAvailability ? 'Checking availability…' : availableSlots.length ? 'Select a time slot…' : 'No time slots available'}</option>{availableSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="purpose">Purpose</Label><Input id="purpose" placeholder="e.g. Client presentation" {...register('purpose')} /></div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isBooking}>{isBooking ? 'Booking…' : 'Book Asset'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
};
