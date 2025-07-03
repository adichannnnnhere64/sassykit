import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, Group, Textarea, TextInput } from '@mantine/core';
import { FormEventHandler } from 'react';

type ColumnForm = {
    content: string;
    card_id: string | number;
    board_id: string | number;
    title: string;
};

export default function EditCard({
    column_id,
    board_id,
    card,
}: {
    column_id: string | number;
    board_id: string | number;
    card: Module.Kanban.DTOs.CardData;
}) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ColumnForm>>({
        content: card.content ?? '',
        title: card.title ?? '',
        card_id: card.id,
        board_id: board_id,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('module.kanban.card.update'), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('module.kanban.board.show', board_id), {
                    preserveScroll: true,
                });
                close();
            },
        });
    };

    return (
        <form onSubmit={submit}>
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
