import Board from '@/components/kanban/board';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Board',
        href: '/boards',
    },
    {
        title: 'Columns',
        href: '/boards',
    },

];

export default function Index({ initialData, initialDefaultColumn, initialColumnNames, board }: { initialData: any; initialDefaultColumn: string, initialColumnNames: any, board: Module.Kanban.DTOs.BoardData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Boards" />
            <Board board={board} initialDefaultColumn={initialDefaultColumn} initialData={initialData} initialColumnNames={initialColumnNames} />
        </AppLayout>
    );
}
