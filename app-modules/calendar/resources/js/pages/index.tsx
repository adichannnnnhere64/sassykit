import AppLayout from '@/layouts/app-layout';
import { Stack, Group, Badge, Title, Paper, Button, Modal, TextInput, MultiSelect, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

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

interface Category {
    name: string;
    color: string;
}

interface Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    categories: Category[];
    status?: 'pending' | 'completed' | 'cancelled';
}

interface CalendarPageProps {
    defaultCategories?: Category[];
    defaultEvents?: Event[];
    defaultColor?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
    { name: 'work', color: '#3174ad' },
    { name: 'personal', color: '#ff6b6b' },
    { name: 'meeting', color: '#51cf66' },
    { name: 'deadline', color: '#ffa94d' },
    { name: 'appointment', color: '#9775fa' },
    { name: 'travel', color: '#20c997' },
];

export default function CalendarPage({
    defaultCategories = DEFAULT_CATEGORIES,
    defaultEvents = [],
    defaultColor = '#5c6bc0'
}: CalendarPageProps) {
    const [categories] = useState<Category[]>(defaultCategories);
    const [events, setEvents] = useState<Event[]>(
        defaultEvents.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            categories: event.categories || [],
        }))
    );

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<Views>(Views.WEEK);

    // Modal state
  const [modalOpened, setModalOpened] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [slotInfo, setSlotInfo] = useState<any>(null);

    const handleEventDrop = useCallback(
        ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
            const { allDay } = event;

            if (!allDay && droppedOnAllDaySlot) {
                event.allDay = true;
            }
            if (allDay && !droppedOnAllDaySlot) {
                event.allDay = false;
            }

            setEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== event.id);
                return [...filtered, {
                    ...existing,
                    start,
                    end,
                    allDay: event.allDay
                }];
            });
        },
        [setEvents]
    );

    const handleEventResize = useCallback(
        ({ event, start, end }) => {
            setEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== event.id);
                return [...filtered, { ...existing, start, end }];
            });
        },
        [setEvents]
    );

    const handleSelectSlot = (slotInfo) => {
        setSlotInfo(slotInfo);
        setCurrentEvent(null);
        setNewEventTitle('');
        setSelectedCategories([]);
        setModalOpened(true);
    };

    const handleSelectEvent = (event) => {
        setCurrentEvent(event);
        setNewEventTitle(event.title);
        setSelectedCategories(event.categories.map(c => c.name));
        setModalOpened(true);
    };

    const handleSaveEvent = () => {
        if (!newEventTitle.trim()) return;

        const selectedCategoryObjects = categories.filter(cat =>
            selectedCategories.includes(cat.name)
        );

        if (currentEvent) {
            // Update existing event
            const updatedEvent = {
                ...currentEvent,
                title: newEventTitle,
                categories: selectedCategoryObjects,
            };
            setEvents(prev => prev.map(evt => (evt.id === currentEvent.id ? updatedEvent : evt)));
        } else {
            // Create new event
            const newEvent: Event = {
                id: Date.now(),
                title: newEventTitle,
                start: new Date(slotInfo.start),
                end: new Date(slotInfo.end),
                allDay: slotInfo.slots.length === 1,
                categories: selectedCategoryObjects,
                status: 'pending',
            };
            setEvents(prev => [...prev, newEvent]);
        }

        setModalOpened(false);
    };

    const handleDeleteEvent = () => {
        if (currentEvent) {
            setEvents(prev => prev.filter(evt => evt.id !== currentEvent.id));
            setModalOpened(false);
        }
    };

    const handleNavigate = (date: Date) => {
        setCurrentDate(date);
    };

    const handleViewChange = (view: Views) => {
        setCurrentView(view);
    };

    const handleSaveCalendar = async () => {
        try {
            await axios.post('/api/calendar/save', {
                currentDate: currentDate.toISOString(),
                currentView,
                events: events.map(event => ({
                    ...event,
                    start: event.start.toISOString(),
                    end: event.end.toISOString(),
                    categories: event.categories
                }))
            });
            alert('Current events saved successfully!');
        } catch (error) {
            alert('Error saving calendar');
            console.error(error);
        }
    };

    const eventPropGetter = (event: Event) => {
        return {
            style: {
                backgroundColor: defaultColor,
                borderRadius: '4px',
                border: `2px solid ${defaultColor}`,
                color: 'white',
                fontSize: '12px',
                textDecoration: event.status === 'completed' ? 'line-through' : 'none',
            },
        };
    };

    const eventComponent = ({ event }) => {
        return (
            <div>
                <strong>{event.title}</strong>
                {event.categories?.length > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {event.categories.map(category => (
                            <span
                                key={category.name}
                                style={{
                                    fontSize: '10px',
                                    padding: '2px 4px',
                                    backgroundColor: category.color,
                                    borderRadius: '3px',
                                    color: 'white',
                                    lineHeight: 1,
                                }}
                            >
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppLayout>
            <Stack spacing="lg">
                <Group position="apart">
                    <Paper p="md" withBorder>
                        <Title order={5} mb="sm">Category Color Key</Title>
                        <Group spacing="sm">
                            {categories.map(category => (
                                <Badge
                                    key={category.name}
                                    variant="filled"
                                    style={{
                                        backgroundColor: category.color,
                                        color: 'white',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {category.name}
                                </Badge>
                            ))}
                        </Group>
                    </Paper>

                    <Button
                        onClick={handleSaveCalendar}
                        variant="outline"
                        leftIcon={<IconDownload size={16} />}
                    >
                        Save Current Events
                    </Button>
                </Group>

                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    view={currentView}
                    onView={handleViewChange}
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
                    style={{ height: '70vh' }}
                    defaultDate={currentDate}
                    draggableAccessor={() => true}
                    eventPropGetter={eventPropGetter}
                    components={{
                        event: eventComponent
                    }}
                />

                {/* Event Modal */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={currentEvent ? "Edit Event" : "Create New Event"}
                    size="md"
                >
                    <Stack spacing="md">
                        <TextInput
                            label="Event Title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.currentTarget.value)}
                            placeholder="Enter event title"
                            required
                        />

                        <MultiSelect
                            label="Categories"
                            data={categories.map(c => ({ value: c.name, label: c.name }))}
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                            placeholder="Select categories"
                            searchable
                            clearable
                        />

                        {currentEvent && (
                            <Text size="sm" color="dimmed">
                                {currentEvent.allDay ? "All day event" :
                                    `From ${currentEvent.start.toLocaleString()} to ${currentEvent.end.toLocaleString()}`}
                            </Text>
                        )}

                        <Group position="right" spacing="sm">
                            {currentEvent && (
                                <Button
                                    color="red"
                                    variant="outline"
                                    onClick={handleDeleteEvent}
                                >
                                    Delete
                                </Button>
                            )}
                            <Button
                                onClick={handleSaveEvent}
                                disabled={!newEventTitle.trim()}
                            >
                                {currentEvent ? "Update" : "Create"}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Stack>
        </AppLayout>
    );
}
