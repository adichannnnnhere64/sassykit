import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { Stack } from '@mantine/core';
import AppLayout from '@/layouts/app-layout';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'All Day Event',
      start: new Date(2023, 10, 1),
      end: new Date(2023, 10, 1),
      allDay: true,
    },
    {
      id: 2,
      title: 'Timed Event',
      start: new Date(2023, 10, 2, 12, 0, 0),
      end: new Date(2023, 10, 2, 14, 0, 0),
      allDay: false,
    },
  ]);

  const [currentDate, setCurrentDate] = useState(new Date());

  const handleEventDrop = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    const updatedEvent = {
      ...event,
      start: new Date(start),
      end: new Date(end),
      allDay: droppedOnAllDaySlot,
    };

    setEvents(prev =>
      prev.map(evt => (evt.id === event.id ? updatedEvent : evt))
    );
  };

  const handleEventResize = ({ event, start, end }) => {
    const updatedEvent = {
      ...event,
      start: new Date(start),
      end: new Date(end),
    };

    setEvents(prev =>
      prev.map(evt => (evt.id === event.id ? updatedEvent : evt))
    );
  };

  const handleSelectSlot = slotInfo => {
    const title = window.prompt('New Event Name');
    if (!title) return;

    const newEvent: Event = {
      id: Date.now(),
      title,
      start: new Date(slotInfo.start),
      end: new Date(slotInfo.end),
      allDay: slotInfo.slots.length === 1,
    };

    setEvents(prev => [...prev, newEvent]);
  };

  const handleSelectEvent = event => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      setEvents(prev => prev.filter(evt => evt.id !== event.id));
    }
  };

  const handleNavigate = date => {
    setCurrentDate(date);
  };

  return (
    <AppLayout>
      <Stack>
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          startAccessor="start"
          endAccessor="end"
          allDayAccessor="allDay"
          resizable
          selectable
          popup
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onNavigate={handleNavigate}
          style={{ height: '80vh' }}
          defaultDate={currentDate}
          draggableAccessor={() => true}
          eventPropGetter={event => ({
            style: {
              backgroundColor: event.allDay ? '#3174ad' : '#3174ad',
              borderRadius: '4px',
              border: 'none',
              color: 'white',
            },
          })}
        />
      </Stack>
    </AppLayout>
  );
}
