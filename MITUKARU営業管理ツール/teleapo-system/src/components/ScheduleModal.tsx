'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Mail, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface TimeSlot {
    start: string;
    end: string;
    available: boolean;
}

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerEmail: string | null;
    customerName: string;
    companyName: string;
    onBook: (slot: { date: string; startTime: string; endTime: string }) => Promise<void>;
}

export default function ScheduleModal({
    isOpen,
    onClose,
    customerEmail,
    customerName,
    companyName,
    onBook,
}: ScheduleModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [meetLink, setMeetLink] = useState<string | null>(null);

    // Generate dates for the week
    const getWeekDates = (baseDate: Date) => {
        const dates: Date[] = [];
        const startOfWeek = new Date(baseDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day + 1); // Monday

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates(selectedDate);

    // Fetch available slots when date changes
    useEffect(() => {
        if (!isOpen) return;

        const fetchSlots = async () => {
            setLoading(true);
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const response = await fetch(`/api/calendar/availability?date=${dateStr}`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableSlots(data.slots || []);
                } else {
                    // If API fails, show default slots
                    setAvailableSlots(generateDefaultSlots());
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
                setAvailableSlots(generateDefaultSlots());
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, isOpen]);

    // Generate default time slots (for demo/fallback)
    const generateDefaultSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const hours = [9, 10, 11, 13, 14, 15, 16, 17];
        hours.forEach(hour => {
            slots.push({
                start: `${hour.toString().padStart(2, '0')}:00`,
                end: `${hour.toString().padStart(2, '0')}:30`,
                available: Math.random() > 0.3,
            });
            slots.push({
                start: `${hour.toString().padStart(2, '0')}:30`,
                end: `${(hour + 1).toString().padStart(2, '0')}:00`,
                available: Math.random() > 0.3,
            });
        });
        return slots;
    };

    const handlePrevWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedDate(newDate);
    };

    const handleBook = async () => {
        if (!selectedSlot) return;

        setBooking(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];

            const response = await fetch('/api/calendar/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateStr,
                    startTime: selectedSlot.start,
                    endTime: selectedSlot.end,
                    customerEmail,
                    customerName,
                    companyName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMeetLink(data.meetLink);
                setBookingSuccess(true);
                await onBook({
                    date: dateStr,
                    startTime: selectedSlot.start,
                    endTime: selectedSlot.end,
                });
            }
        } catch (error) {
            console.error('Error booking:', error);
        } finally {
            setBooking(false);
        }
    };

    const formatDate = (date: Date) => {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        return {
            month: date.getMonth() + 1,
            day: date.getDate(),
            dayName: days[date.getDay()],
        };
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const isPast = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    if (!isOpen) return null;

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                <div className="schedule-modal-header">
                    <div className="schedule-modal-title">
                        <Calendar size={20} />
                        <span>空きスケジュール</span>
                    </div>
                    <button className="schedule-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {bookingSuccess ? (
                    <div className="schedule-booking-success">
                        <div className="success-icon">
                            <Video size={48} />
                        </div>
                        <h3>予約が完了しました！</h3>
                        <p>Google Meetリンクを発行し、{customerEmail ? `${customerEmail} にメールを送信しました。` : '招待メールを送信しました。'}</p>
                        {meetLink && (
                            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="meet-link">
                                {meetLink}
                            </a>
                        )}
                        <button className="btn btn-primary" onClick={onClose}>
                            閉じる
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="schedule-modal-body">
                            {/* Week Navigation */}
                            <div className="week-navigation">
                                <button className="week-nav-btn" onClick={handlePrevWeek}>
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="week-label">
                                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                                </span>
                                <button className="week-nav-btn" onClick={handleNextWeek}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Date Selector */}
                            <div className="date-selector">
                                {weekDates.map((date, index) => {
                                    const { month, day, dayName } = formatDate(date);
                                    const past = isPast(date);
                                    return (
                                        <button
                                            key={index}
                                            className={`date-btn ${isSelected(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''} ${past ? 'past' : ''}`}
                                            onClick={() => !past && setSelectedDate(date)}
                                            disabled={past}
                                        >
                                            <span className="date-day-name">{dayName}</span>
                                            <span className="date-number">{day}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Slots */}
                            <div className="time-slots-container">
                                <h4 className="time-slots-title">
                                    <Clock size={16} />
                                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の空き時間
                                </h4>

                                {loading ? (
                                    <div className="time-slots-loading">
                                        <Loader2 size={24} className="spin" />
                                        <span>読み込み中...</span>
                                    </div>
                                ) : (
                                    <div className="time-slots-grid">
                                        {availableSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                                                onClick={() => slot.available && setSelectedSlot(slot)}
                                                disabled={!slot.available}
                                            >
                                                {slot.start}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="booking-info">
                                <div className="booking-info-item">
                                    <span className="booking-info-label">予約先</span>
                                    <span className="booking-info-value">{companyName}</span>
                                </div>
                                {customerEmail && (
                                    <div className="booking-info-item">
                                        <Mail size={14} />
                                        <span className="booking-info-value">{customerEmail}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="schedule-modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>
                                キャンセル
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBook}
                                disabled={!selectedSlot || booking}
                            >
                                {booking ? (
                                    <>
                                        <Loader2 size={16} className="spin" />
                                        予約中...
                                    </>
                                ) : (
                                    <>
                                        <Video size={16} />
                                        予約してMeetを発行
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
