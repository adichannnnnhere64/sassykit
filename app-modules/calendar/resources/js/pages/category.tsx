import AppLayout from '@/layouts/app-layout';
import { open } from '@/useModal';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Stack, Table } from '@mantine/core';

interface Category {
    id: number;
    name: string;
    color: string;
}

export default function Calendar({ categories = [] }: { categories: Category[] }) {
    const { version } = usePage();

    const rows = categories.map((element) => (
        <Table.Tr key={element.name}>
            <Table.Td>{element.name}</Table.Td>
            <Table.Td> <div className="w-5 h-5 rounded-full" style={{ backgroundColor: element.color }} title=""> </div> </Table.Td>
            <Table.Td className="flex space-x-2">
                <button onClick={() => open(route('calendar.category.create', { id: element.id }), version ?? '', 'xs')}>Edit</button>
                <Link
                    className="ml-1 text-red-500"
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
                    href={route('calendar.category.destroy', element.id)}
                >
                    Delete
                </Link>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <AppLayout>
            <Stack mb="md">
                <Button className="!w-40" onClick={() => open(route('calendar.category.create'), version ?? '', 'xs')}>Add Category</Button>
            </Stack>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Color</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </AppLayout>
    );
}
