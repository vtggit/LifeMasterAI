import { format, isToday } from "date-fns";

interface DaySelectorProps {
  days: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function DaySelector({ days, selectedDate, onSelectDate }: DaySelectorProps) {
  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  return (
    <div className="flex space-x-2 overflow-x-auto py-1">
      {days.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayIsToday = isToday(day);
        
        return (
          <div 
            key={index}
            className="flex-shrink-0 w-14 text-center"
            onClick={() => onSelectDate(day)}
          >
            <div className="text-xs text-gray-500">
              {format(day, 'EEE')}
            </div>
            <div 
              className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto my-1 font-medium 
                ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {format(day, 'd')}
            </div>
            <div className="text-xs font-medium">
              {dayIsToday ? 'Today' : index === 1 ? 'Tomorrow' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
