import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, Group, Textarea, TextInput } from '@mantine/core';
import { FormEventHandler } from 'react';

type ColumnForm = {
    content: string;
    column_id: string | number;
    board_id: string | number;
    title: string;
};

export default function CreateCard({ column_id, board_id }: { column_id: string | number; board_id: string | number }) {
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<ColumnForm>>({
        content: '',
        title: '',
        column_id: column_id,
        board_id: board_id,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('module.kanban.card.store'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log(column_id)
                router.visit(route('module.kanban.board.show', board_id), {
                    preserveScroll: true,
                    data: {
                        default_column_open: column_id
                    }
                });
                close();
            },
        });
    };

    return (
        <form className="block space-y-4" onSubmit={submit}>
            <TextInput
                withAsterisk
                label="Title"
                autoFocus
                placeholder="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={errors.title}
            />
            <Textarea
                withAsterisk
                rows={10}
                label="Content"
                placeholder="content"
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                error={errors.content}
            />

            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
}
