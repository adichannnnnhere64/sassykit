import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, Group, Textarea, TextInput } from '@mantine/core';
import { FormEventHandler } from 'react';

type ColumnForm = {
    board_id: string | number;
    column_id: string | number;
    content: string;
};

export default function BoardGenerator({
    board_id,
    column_id,
}: {
    column_id: string | number;
    board_id: string | number;
    card: Module.Kanban.DTOs.CardData;
}) {
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<ColumnForm>>({
        board_id: board_id,
        column_id: column_id,
        content: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('board.generate'), {
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
