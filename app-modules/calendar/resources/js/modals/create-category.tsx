import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, ColorInput, Group, TextInput } from '@mantine/core';
import { FormEventHandler } from 'react';

interface Category {
    id: number;
    name: string;
    color: string;
}

export default function CreateCategory({ category = null } : { category: Category | null }) {
    const { data, setData, post, put } = useForm({
        id : category?.id ?? null,
        name: category?.name ??  '',
        color: category?.color ?? '#228be6', // Default color
    });

    const submitHandler: FormEventHandler = (e) => {
        e.preventDefault();

        if (category == null) {
        post(route('calendar.category.store'), {
            onSuccess: () => {
                router.visit(window.location.href, {
                    preserveScroll: true,
                });

                close();
            },
        });
        } else {
        put(route('calendar.category.update.model'), {
            onSuccess: () => {
                router.visit(window.location.href, {
                    preserveScroll: true,
                });

                close();
            },
        });

        }


    };

    return (
        <form onSubmit={submitHandler} className="space-y-3">
            <TextInput label="Name" autoFocus value={data.name} onChange={(e) => setData('name', e.target.value)} required />
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
                required
            />
            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
}
