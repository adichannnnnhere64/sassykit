import { close } from '@/useModal';
import { router, useForm } from '@inertiajs/react';
import { Button, Checkbox, Group, TextInput } from '@mantine/core';
import { FormEventHandler } from 'react';

type ColumnForm = {
    title: string;
    board_id: string|number;
}

export default function CreateColumn({board_id} : {
    board_id: string|number
}) {

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<Required<ColumnForm>>({
        title: '',
        board_id: board_id,
    });

   const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('module.kanban.column.store'), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('module.kanban.board.show', board_id));
                close();
            }
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

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
