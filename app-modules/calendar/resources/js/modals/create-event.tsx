import MultiSelectCombobox from '@/components/pills-input';
import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, ColorInput, Group, Textarea, TextInput } from '@mantine/core';
import { DateInput, TimePicker } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { FormEventHandler } from 'react';

export default function CreateEvent({
    start_time,
    end_time,
    start_date,
    end_date,
    categories,
    id,
    title,
    description,
    userCategories,
    color = '#2e2e2e',
}: {
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
    categories: [];
    id: Number | null;
    title?: string;
    description?: string;
    userCategories?: [];
    color: string;
}) {
    const { data, setData, post, put } = useForm({
        start: start_time,
        end: end_time,
        start_date: start_date,
        end_date: end_date,
        title: title,
        description: description,
        categories: userCategories,
        color: color ?? '#2e2e2e',
    });

    // const categories = [
    //     { value: '1', label: '🍎 Apples' },
    //     { value: '2', label: '🍌 Bananas' },
    //     { value: '3', label: '🥦 Broccoli' },
    //     { value: '4', label: '🥕 Carrots' },
    //     { value: '5', label: '🍫 Chocolate' },
    // ];

    // console.log(categories, defaultCategories)
    //

    const handleDeleteEvent = (e) => {
        e.preventDefault();
        router.delete(route('calendar.destroy', { id }), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                close();
            },
        });
    };

    const submitHandler: FormEventHandler = (e) => {
        e.preventDefault();

        // console.log(id);
        if (id == null) {
            post(route('calendar.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    close();
                },
            });
        } else {
            put(route('calendar.update', { id }), {
                preserveScroll: true,
                onSuccess: () => {
                    close();
                },
            });
        }
    };

    return (
        <>
            <form onSubmit={submitHandler} className="space-y-3">
                <TextInput required label="Title" autoFocus value={data.title} onChange={(e) => setData('title', e.target.value)} />
                <Textarea label="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} />

                <DateInput
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.toString())}
                    label="Date input"
                    placeholder="Date input"
                />
                <TimePicker label="Start" value={data.start} withDropdown format="12h" onChange={(e) => setData('start', e.toString())} />
                <DateInput value={data.end_date} onChange={(e) => setData('end_date', e.toString())} label="Date input" placeholder="Date input" />
                <TimePicker label="End" value={data.end} withDropdown format="12h" onChange={(e) => setData('end', e.toString())} />
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
                    <Button type="submit">Submit</Button>
                    {id && (
                        <Button onClick={handleDeleteEvent} className="!border-red-500 !text-red-500" variant="outline">
                            Delete
                        </Button>
                    )}
                </Group>
            </form>
        </>
    );
}
