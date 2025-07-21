import AppLayout from '@/layouts/app-layout';
import { open } from '@/useModal';
import { Link, router, usePage } from '@inertiajs/react';
import { Badge, Button, Flex, Group, Paper, Stack, Text } from '@mantine/core';
import axios from 'axios';
import addMonths from 'date-fns/addMonths';
import endOfWeek from 'date-fns/endOfWeek';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import subMonths from 'date-fns/subMonths';
import { useCallback, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
    amount?: number;
    color?: string;
}

interface CalendarPageProps {
    defaultCategories?: Category[];
    defaultEvents?: Event[];
    defaultColor?: string;
    total?: number;
}

export default function CalendarPage({ defaultCategories = [], defaultEvents = [], defaultColor = '#5c6bc0', total = 0 }: CalendarPageProps) {
    const [categories] = useState<Category[]>(defaultCategories);
    const [events, setEvents] = useState<Event[]>(
        defaultEvents.map((event) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            categories: event.categories || [],
        })),
    );
    const [currentTotal, setCurrentTotal] = useState(total);
    const [currentView, setCurrentView] = useState<Views>(
        // Get initial view from URL or default to MONTH
        (new URLSearchParams(window.location.search).get('view') as Views) || Views.MONTH,
    );
    const [currentDate, setCurrentDate] = useState<Date>(
        // Get initial date from URL or default to now
        new Date(new URLSearchParams(window.location.search).get('date') || new Date()),
    );

    const [isLoading, setIsLoading] = useState(false);
    const { version } = usePage();

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const calculateDateRange = useCallback((date: Date, view: Views) => {
        let start: Date, end: Date;

        switch (view) {
            case Views.MONTH:
                start = new Date(date.getFullYear(), date.getMonth(), 1);
                end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                break;
            case Views.WEEK:
                start = startOfWeek(date, { weekStartsOn: 1 });
                end = endOfWeek(date, { weekStartsOn: 1 });
                break;
            case Views.DAY:
                start = new Date(date);
                start.setHours(0, 0, 0, 0);
                end = new Date(date);
                end.setHours(23, 59, 59, 999);
                break;
            case Views.AGENDA:
                // Show 6 months of events in agenda view
                start = subMonths(new Date(date), 0);
                end = addMonths(new Date(date), 1);
                break;
            default:
                start = new Date(date);
                end = new Date(date);
        }

        // Ensure proper time boundaries
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    }, []);

    const fetchEventsForRange = useCallback(
        async (start: Date, end: Date, view: Views) => {
            setIsLoading(true);
            try {
                const response = await axios.get(route('calendar.events'), {
                    params: {
                        start: start.toISOString(),
                        end: end.toISOString(),
                        view: view === Views.AGENDA ? 'agenda' : null,
                        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
                    },
                });

                const formattedEvents = response.data.events.map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    categories: event.categories || [],
                }));

                setEvents(formattedEvents);
                setCurrentTotal(response.data.total);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [selectedCategories],
    ); // Add selectedCategories to dependencies

    useEffect(() => {
        const { start, end } = calculateDateRange(currentDate, currentView);
        fetchEventsForRange(start, end, currentView);
    }, [currentDate, currentView, fetchEventsForRange, calculateDateRange, selectedCategories]);

    // useEffect(() => {
    //     const { start, end } = calculateDateRange(currentDate, currentView);
    //     fetchEventsForRange(start, end, currentView);
    // }, [currentDate, currentView, fetchEventsForRange, calculateDateRange]);

    const handleEventDrop = useCallback(
        ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
            const { allDay } = event;

            // if (!allDay && droppedOnAllDaySlot) {
            // event.allDay = true;
            // }
            // if (allDay && !droppedOnAllDaySlot) {
            event.allDay = false;
            // }

            // console.log(start, end);

            setEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== event.id);
                return [
                    ...filtered,
                    {
                        ...existing,
                        start,
                        end,
                        allDay: false,
                    },
                ];
            });

            router.put(
                route('calendar.update-time', event.id),
                { start, end },
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        },
        [setEvents],
    );

    const [editingCategory, setEditingCategory] = useState<{ id: number | null; name: string }>({ id: null, name: '' });

    const handleCategoryUpdate = (categoryId: number) => {
        if (!editingCategory.name.trim()) return;

        router.patch(
            route('calendar.category.update', categoryId),
            {
                name: editingCategory.name,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCategory({ id: null, name: '' });
                    router.visit(window.location.pathname, {
                        preserveScroll: true,
                        only: ['defaultCategories'],
                    });
                },
            },
        );
    };

    const handleSelectSlot = (slotInfo: any) => {
        open(
            route('calendar.create-modal', {
                start: slotInfo.start.toISOString(),
                end: slotInfo.end.toISOString(),
            }),
            version ?? '',
        );
    };

    const handleSelectEvent = (event: Event) => {
        open(
            route('calendar.create-modal', {
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                id: event.id,
            }),
            version ?? '',
        );
    };

    const handleViewChange = (view: Views) => {
        setCurrentView(view);
        // Update URL without reload
        window.history.replaceState({}, '', `?view=${view}&date=${currentDate.toISOString()}`);
    };

    // Handle navigation
    const handleNavigate = (date: Date) => {
        setCurrentDate(date);
        // Update URL without reload
        window.history.replaceState({}, '', `?view=${currentView}&date=${date.toISOString()}`);
    };

    const eventPropGetter = (event: Event) => {
        return {
            style: {
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                textDecoration: event.status === 'completed' ? 'line-through' : 'none',
            },
        };
    };

    const eventComponent = ({ event }: { event: Event }) => {
        // console.log(event);
        return (
            <div>
                <div className="grid grid-cols-2">
                    <strong>{event.title}</strong>
                    {event.amount && <strong className="text-right">${event.amount}</strong>}
                </div>
                {event.categories?.length > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {event.categories.map((category) => (
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

    const agendaEventComponent = ({ event }: { event: Event }) => {
        return (
            <div className="border-b  p-3 ">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900">{event.title}</div>
                        <div className="mt-1 text-sm text-gray-600">
                            {format(event.start, 'EEEE, MMMM d, yyyy')}
                        </div>

                    </div>
                        {event.categories?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {event.categories.map((category) => (
                                    <span
                                        key={category.name}
                                        className="rounded-full px-2 py-1 text-xs text-white"
                                        style={{ backgroundColor: category.color }}
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    {event.amount && <div className="ml-4 text-sm font-semibold text-gray-900">${event.amount.toLocaleString()}</div>}
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Stack spacing="lg">
                <Flex justify="space-between" align="center">
                    <Paper p="md" withBorder>
                        <div className="flex space-x-4">
                        <Button mb={20} size="xs" onClick={() => open(route('calendar.category.create'), version ?? '', 'xs')}>
                            Add Category
                        </Button>

                            <Button onClick={() => router.visit(route('calendar.category'))} mb={20} size="xs" variant='white' >Edit</Button>
</div>
                        <Group spacing="sm">
                            {categories.map((category) => (
                                <div key={category.name} className="flex items-center">
                                    {editingCategory.id === category.id ? (
                                        <input
                                            type="text"
                                            value={editingCategory.name}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCategoryUpdate(category.id)}
                                            onBlur={() => handleCategoryUpdate(category.id)}
                                            autoFocus
                                            className="w-32 rounded border px-1 py-0.5 text-sm"
                                        />
                                    ) : (
                                        <>
                                            <Badge
                                                variant="filled"
                                                style={{
                                                    backgroundColor: category.color,
                                                    color: 'white',
                                                    textTransform: 'capitalize',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                                            >
                                                {category.name}
                                            </Badge>
                                            <Link
                                                className="ml-1 text-gray-500"
                                                method="delete"
                                                onSuccess={() => {
                                                    router.visit(window.location.pathname, {
                                                        preserveScroll: true,
                                                    });
                                                }}
                                                onClick={(e) => {
                                                    if (!window.confirm('Are you sure you want to delete this category?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                href={route('calendar.category.destroy', category.id)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    className="tabler-icon tabler-icon-x"
                                                >
                                                    <path d="M18 6l-12 12"></path>
                                                    <path d="M6 6l12 12"></path>
                                                </svg>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ))}
                        </Group>
                    </Paper>
                    <Button
                        size="xs"
                        onClick={() =>
                            open(
                                route('calendar.create-modal', {
                                    start: currentDate.toISOString(),
                                    end: currentDate.toISOString(),
                                }),
                                version ?? '',
                            )
                        }
                    >
                        Add Event
                    </Button>
                </Flex>

                <Paper p="md" withBorder>
                    <Flex gap="sm" align="center">
                        <Text size="sm" weight={500}>
                            Filter by:
                        </Text>
                        {categories.map((category) => (
                            <Badge
                                key={category.id}
                                variant={selectedCategories.includes(category.id) ? 'filled' : 'outline'}
                                style={{
                                    backgroundColor: selectedCategories.includes(category.id) ? category.color : undefined,
                                    color: selectedCategories.includes(category.id) ? 'white' : undefined,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                                onClick={() => {
                                    setSelectedCategories((prev) =>
                                        prev.includes(category.id) ? prev.filter((id) => id !== category.id) : [...prev, category.id],
                                    );
                                }}
                            >
                                {category.name}
                            </Badge>
                        ))}
                        {selectedCategories.length > 0 && (
                            <Button size="xs" variant="subtle" onClick={() => setSelectedCategories([])}>
                                Clear filters
                            </Button>
                        )}
                    </Flex>
                </Paper>

                <Paper p="md" withBorder>
                    <Flex justify="space-between" align="center">
                        <Text size="sm" weight={500}>
                            Total Amount:
                        </Text>
                        <Text size="lg" weight={700}>
                            ${currentTotal.toLocaleString()}
                        </Text>
                    </Flex>
                </Paper>
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    view={currentView}
                    onView={handleViewChange}
                    defaultView={Views.MONTH}
                    views={[Views.MONTH, Views.AGENDA]}
                    step={30}
                    timeslots={2}
                    min={new Date(0, 0, 0, 8, 0, 0)}
                    max={new Date(0, 0, 0, 22, 0, 0)}
                    startAccessor="start"
                    endAccessor="end"
                    allDayAccessor="allDay"
                    selectable
                    popup
                    onEventDrop={handleEventDrop}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onNavigate={handleNavigate}
                    style={{ height: '80vh' }}
                    defaultDate={currentDate}
                    draggableAccessor={() => true}
                    eventPropGetter={eventPropGetter}
                    components={{
                        event: eventComponent,
                        agenda: {
                            event: agendaEventComponent,
                            header: () => (isLoading ? <div className="p-4 text-center text-gray-500">Loading events...</div> : null),
                        },
                    }}
                    messages={{
                        agenda: 'Agenda',
                        date: 'Date',
                        time: 'Time',
                        event: 'Event',
                        noEventsInRange: 'No events found in this date range.',
                        showMore: (count) => `+${count} more events`,
                    }}
                />
            </Stack>
        </AppLayout>
    );
}
