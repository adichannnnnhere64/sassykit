import MultiSelectCombobox from '@/components/pills-input';
import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, ColorInput, Group, Textarea, TextInput } from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { FormEventHandler } from 'react';

export default function CreateEvent({
    start_time,
    end_time,
    start_date,
    categories,
    id,
    title,
    description,
    userCategories,
    color = '#2e2e2e',
    amount = '',
}: {
    start_time: string;
    end_time: string;
    start_date: string;
    categories: [];
    id: number | null;
    title?: string;
    description?: string;
    userCategories?: [];
    color: string;
    amount: string;
}) {
    const { data, setData, post, put } = useForm({
        title: title || '',
        description: description || '',
        categories: userCategories || [],
        color: color || '#2e2e2e',
        amount: amount || '',
        start_date: start_date,
        start_time: start_time || '00:00',
        end_time: end_time || '01:00',
    });

    const handleDeleteEvent = (e: React.MouseEvent) => {
        e.preventDefault();
        if (id && window.confirm('Are you sure you want to delete this event?')) {
            router.delete(route('calendar.destroy', { id }), {
                preserveScroll: true,
                onSuccess: () => {
                    close();
                    router.visit(route('calendar.index'), {
                        only: ['defaultEvents', 'total'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                },
            });
        }
    };

    const submitHandler: FormEventHandler = (e) => {
        e.preventDefault();

        // Combine date and time into ISO strings
        // const startDateTime = new Date(data.start_date);
        // const [startHours, startMinutes] = data.start_time.split(':').map(Number);
        // startDateTime.setHours(startHours, startMinutes);

        // const endDateTime = new Date(data.start_date);
        // const [endHours, endMinutes] = data.end_time.split(':').map(Number);
        // endDateTime.setHours(endHours, endMinutes);

        const submitMethod = id ? put : post;
        const routeName = id ? route('calendar.update', { id }) : route('calendar.store');

        submitMethod(routeName, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(window.location.pathname, {
                    only: ['defaultEvents', 'total'],
                    preserveScroll: true,
                    onSuccess: () => {
                        close();
                    },

                    data: {
                        view: new URLSearchParams(window.location.search).get('view') || 'month',
                        date: new URLSearchParams(window.location.search).get('date') || new Date().toISOString(),
                    },
                });
            },
        });
    };

    return (
        <form onSubmit={submitHandler} className="space-y-3">
            <TextInput required label="Title" autoFocus value={data.title} onChange={(e) => setData('title', e.target.value)} />

            <TextInput required label="Amount" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />

            <Textarea label="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} />

            <DateInput
                required
                value={data.start_date}
                onChange={(date) => setData('start_date', date)}
                label="Event Date"
                placeholder="Select date"
            />

            <MultiSelectCombobox
                label="Categories"
                data={categories}
                placeholder="Select categories"
                value={data.categories}
                onChange={(values) => setData('categories', values)}
            />

            <ColorInput
                label="Color"
                value={data.color}
                onChange={(color) => setData('color', color)}
                format="hex"
                swatches={[
                    '#2e2e2e',
                    '#868e96',
                    '#fa5252',
                    '#e64980',
                    '#be4bdb',
                    '#7950f2',
                    '#4c6ef5',
                    '#228be6',
                    '#15aabf',
                    '#12b886',
                    '#40c057',
                    '#82c91e',
                    '#fab005',
                    '#fd7e14',
                ]}
            />

            <Group justify="flex-end" mt="md">
                {id && (
                    <Button onClick={handleDeleteEvent} className="!border-red-500 !text-red-500" variant="outline">
                        Delete
                    </Button>
                )}

                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
}
