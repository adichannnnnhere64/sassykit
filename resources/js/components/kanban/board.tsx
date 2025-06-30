import { DndContext, DragOverlay, PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    rectSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Button, Flex } from '@mantine/core';
import { produce } from 'immer';
import { useEffect, useRef, useState } from 'react';
import ModalLink from '../modal-link';

export default function Board({ initialData = {}, initialColumnNames = {}, board = null }: any) {
    const [columns, setColumns] = useState(initialData);
    const [activeId, setActiveId] = useState(null);
    const [activeType, setActiveType] = useState(null);
    const [viewMode, setViewMode] = useState('vertical');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [columnOrder, setColumnOrder] = useState(Object.keys(initialData));
    const [columnNames, setColumnNames] = useState(initialColumnNames);
    const [collapsedColumns, setCollapsedColumns] = useState({});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
    );

    const toggleColumnCollapse = (columnId) => {
        setCollapsedColumns((prev) => ({
            ...prev,
            [columnId]: !prev[columnId],
        }));
    };

    const findContainer = (id) => {
        if (!id) return null;
        if (columns[id]) {
            return id;
        }
        return Object.keys(columns).find((key) => columns[key].some((item) => item.id === id)) || null;
    };

    const getActiveItem = () => {
        if (!activeId) return null;

        if (activeType === 'Column') {
            return { id: activeId, title: columnNames[activeId] || activeId };
        }

        for (const columnId of Object.keys(columns)) {
            const card = columns[columnId].find((item) => item.id === activeId);
            if (card) return card;
        }
        return null;
    };

    const handleColumnNameChange = (columnId, newName) => {
        setColumnNames((prev) => ({
            ...prev,
            [columnId]: newName,
        }));

        router.patch(
            route('module.kanban.column.update-title'),
            {
                column_id: columnId,
                board_id: board.id,
                title: newName,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setActiveType(active.data.current?.type || 'Card');
        document.body.classList.add('dragging-active');
    };

    const [activeContainer, setActiveContainer] = useState(null);
    const [overContainer, setOverContainer] = useState(null);

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeContainerId = findContainer(active.id);
        const overContainerId = findContainer(over.id);

        setActiveContainer(activeContainerId);
        setOverContainer(overContainerId);

        if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
            return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainerId] || [];
            const overItems = prev[overContainerId] || [];
            const activeIndex = activeItems.findIndex((item) => item.id === active.id);

            if (activeIndex === -1) return prev;

            const activeItem = activeItems[activeIndex];
            if (!activeItem) return prev;

            return {
                ...prev,
                [activeContainerId]: activeItems.filter((item) => item.id !== active.id),
                [overContainerId]: [...overItems, activeItem],
            };
        });
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveType(null);
            document.body.classList.remove('dragging-active');
            return;
        }

        const activeType = active.data.current?.type || 'Card';

        // Handle column reordering
        if (activeType === 'Column') {
            if (active.id !== over.id) {
                setColumnOrder((items) => {
                    const oldIndex = items.indexOf(active.id);
                    const newIndex = items.indexOf(over.id);
                    const newOrder = arrayMove(items, oldIndex, newIndex);
                    router.post(
                        route('module.kanban.column.reorder'),
                        { order: newOrder, board_id: board.id, column_id: active.id },
                        { preserveScroll: true },
                    );
                    return newOrder;
                });
            }
        }
        // Handle card reordering
        else {
            const activeContainerId = findContainer(active.id);
            const overContainerId = findContainer(over.id);

            if (!activeContainerId || !overContainerId) {
                setActiveId(null);
                setActiveType(null);
                document.body.classList.remove('dragging-active');
                return;
            }

            if (activeContainerId === overContainerId) {
                // Reordering within the same column
                const newColumns = produce(columns, (draft) => {
                    const items = [...draft[activeContainerId]];
                    const activeIndex = items.findIndex((item) => item.id === active.id);
                    const overIndex = items.findIndex((item) => item.id === over.id);

                    if (activeIndex !== overIndex) {
                        draft[activeContainerId] = arrayMove(items, activeIndex, overIndex);
                    }
                });

                // Update state immediately
                setColumns(newColumns);

                // Prepare the data to send to server
                const columns_with_card_ids = Object.entries(newColumns).map(([columnId, cards]) => ({
                    column_id: columnId,
                    card_ids: cards.map((card) => card.id),
                }));

                // Send to server
                router.post(route('module.kanban.card.reorder'), { columns_with_card_ids, board_id: board.id }, { preserveScroll: true });
            } else {
                // Moving between columns
                const newColumns = produce(columns, (draft) => {
                    const activeItems = [...draft[activeContainerId]];
                    const overItems = [...draft[overContainerId]];
                    const activeIndex = activeItems.findIndex((item) => item.id === active.id);

                    if (activeIndex !== -1) {
                        const [removed] = activeItems.splice(activeIndex, 1);
                        overItems.push(removed);
                        draft[activeContainerId] = activeItems;
                        draft[overContainerId] = overItems;
                    }
                });

                // Update state immediately
                setColumns(newColumns);

                // Prepare the data to send to server
                const columns_with_card_ids = Object.entries(newColumns).map(([columnId, cards]) => ({
                    column_id: columnId,
                    card_ids: cards.map((card) => card.id),
                }));

                // Send to server
                router.post(route('module.kanban.card.reorder'), { columns_with_card_ids, board_id: board.id }, { preserveScroll: true });
            }
        }

        setActiveId(null);
        setActiveType(null);
        document.body.classList.remove('dragging-active');
    };
    const csrf_token = String(usePage().props.csrf_token);

    const copyAll = async (board_id: number) => {
        await fetch(route('board.copy.all'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf_token,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ board_id }),
            credentials: 'same-origin',
        })
            .then((res) => res.json())
            .then((data) => {
                navigator.clipboard.writeText(data.clipboard).then(() => {
                    alert('Copied to clipboard');
                });
            });
    };

    return (
        <div className="mt-8">
            <div className="border-b border-gray-200 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Board: {board?.title ?? ''}</h1>
                    <div className="relative z-50">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="hover: flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-white">
                                {viewMode === 'horizontal' ? 'Horizontal View' : 'Vertical View'}
                            </span>
                            <svg
                                className={`h-4 w-4 text-gray-500 transition-transform dark:text-white ${dropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg">
                                <button
                                    onClick={() => {
                                        setViewMode('horizontal');
                                        setDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                        viewMode === 'horizontal' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    }`}
                                >
                                    Horizontal View
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('vertical');
                                        setDropdownOpen(false);
                                    }}
                                    className={`w-full rounded-b-lg px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                        viewMode === 'vertical' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    }`}
                                >
                                    Vertical View
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Flex justify={'space-between'} py={'xs'}>
                <Button onClick={() => copyAll(board?.id)}>Copy All</Button>
                <ModalLink href={route('module.kanban.column.create', { board_id: board?.id })}>Create Recipe</ModalLink>
            </Flex>

            <DndContext
                sensors={sensors}
                collisionDetection={(args) => {
                    const pointerCollisions = pointerWithin(args);
                    if (pointerCollisions.length > 0) {
                        return pointerCollisions;
                    }
                    return rectIntersection(args);
                }}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={columnOrder}
                    strategy={viewMode === 'horizontal' ? horizontalListSortingStrategy : verticalListSortingStrategy}
                >
                    <div className={`py-6 ${viewMode === 'horizontal' ? 'flex gap-6 overflow-x-auto' : 'mx-auto w-full space-y-6'}`}>
                        {columnOrder.map((columnId) => (
                            <Column
                                key={columnId}
                                id={columnId}
                                board_id={board?.id}
                                title={columnNames[columnId]}
                                cards={columns[columnId] || []}
                                viewMode={viewMode}
                                onNameChange={(newName) => handleColumnNameChange(columnId, newName)}
                                isCollapsed={collapsedColumns[columnId] || false}
                                onToggleCollapse={() => toggleColumnCollapse(columnId)}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay
                    adjustScale={false}
                    dropAnimation={{
                        duration: 200,
                        easing: 'ease-out',
                    }}
                >
                    {activeId && activeType === 'Card' ? (
                        <Card id={activeId} image={getActiveItem()?.image} title={getActiveItem()?.title || ''} isDragOverlay viewMode={viewMode} />
                    ) : activeId && activeType === 'Column' ? (
                        <MiniColumnPreview
                            title={columnNames[activeId] || activeId}
                            cardCount={(columns[activeId] || []).length}
                            viewMode={viewMode}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
        </div>
    );
}

function MiniColumnPreview({ title, cardCount, viewMode }) {
    return (
        <div className={`${viewMode === 'horizontal' ? 'w-72' : 'w-full max-w-md'} flex-shrink-0 rotate-2 transform opacity-95`}>
            <div className="flex h-auto flex-col rounded-lg border-2 border-blue-500 shadow-2xl">
                <div className="border-b border-gray-100 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="truncate font-semibold text-gray-800">{title}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{cardCount}</span>
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-opacity-50 bg-blue-50 p-4">
                    <div className="flex h-16 items-center justify-center rounded border-2 border-dashed border-blue-300">
                        <div className="text-sm font-medium text-blue-600">
                            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Column({ id, title, cards, viewMode, onNameChange, isCollapsed, onToggleCollapse, board_id }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: {
            type: 'Column',
        },
        animateLayoutChanges: ({ isSorting, wasDragging }) => !(isSorting || wasDragging),
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef(null);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
        willChange: isDragging ? 'transform' : 'auto',
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleTitleClick = () => {
        setIsEditing(true);
    };

    const handleTitleChange = (e) => {
        setEditedTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (editedTitle.trim() !== title) {
            onNameChange(editedTitle.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTitleBlur();
        }
    };

    const { data, setData, post } = useForm({
        board_id: board_id,
        column_id: id,
    });

    const adi = usePage().props;

    //       useEffect(() => {
    //     if (clipboard) {
    //             alert('bobo')

    //     }
    //   }, [clipboard]);

    const csrf_token = String(usePage().props.csrf_token);

    const copyAll = async (board_id: number, column_id: number) => {
        await fetch(route('board.copy.all'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf_token,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ board_id, column_id }),
            credentials: 'same-origin',
        })
            .then((res) => res.json())
            .then((data) => {
                navigator.clipboard.writeText(data.clipboard).then(() => {
                    alert('Copied to clipboard');
                });
            });
    };

    const copy = async (board_id: number, column_id: number) => {
        await fetch(route('board.copy'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf_token,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ board_id, column_id }),
            credentials: 'same-origin',
        })
            .then((res) => res.json())
            .then((data) => {
                navigator.clipboard.writeText(data.clipboard).then(() => {
                    alert('Copied to clipboard');
                });
            });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${viewMode === 'vertical' ? 'w-full' : 'w-72 flex-shrink-0'} ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
            data-column-id={id}
        >
            <div className={`flex flex-col rounded-lg border border-gray-200 shadow-sm ${isDragging ? 'border-blue-300 shadow-xl' : ''} group`}>
                <div className="cursor-move border-b border-gray-100 p-4" {...attributes} {...listeners}>
                    <div className={`flex items-center justify-between ${viewMode === 'horizontal' ? 'flex-wrap space-y-4' : 'gap-4'}`}>
                        <div className="flex items-center gap-2">
                            <button onClick={onToggleCollapse} className="text-gray-400 hover:text-gray-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={isCollapsed ? 'M9 5l7 7-7 7' : 'M19 9l-7 7-7-7'}
                                    />
                                </svg>
                            </button>
                            {isEditing ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editedTitle}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="w-full rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800"
                                />
                            ) : (
                                <h2 className="cursor-text rounded px-2 py-1 font-semibold hover:bg-gray-100" onClick={handleTitleClick}>
                                    {title}
                                </h2>
                            )}
                        </div>
                        <div className={`flex items-center gap-2 ${viewMode == 'horizontal' ? 'flex-wrap' : ''}`}>
                            <ModalLink href={`${route('module.kanban.card.create', { column_id: id, board_id: board_id })}`}>Add item</ModalLink>
                            <ModalLink href={`${route('module.kanban.card.create-files', { column_id: id, board_id: board_id })}`}>
                                Add image
                            </ModalLink>
                            <ModalLink
                                variant="danger"
                                href={`${route('module.kanban.column.confirm-delete', { column_id: id, board_id: board_id })}`}
                            >
                                Delete
                            </ModalLink>

                            <Button variant="danger" onClick={() => copy(board_id, id)}>
                                Copy
                            </Button>

                            <span className="flex text-sm text-gray-500">{cards.length}</span>
                        </div>
                    </div>
                </div>

                {!isCollapsed && (
                    <div className="group-hog-blue-50/20 relative min-h-[200px] flex-grow p-4">
                        {viewMode === 'horizontal' ? (
                            <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {cards.map((card) => (
                                        <Card key={card.id} id={card.id} image={card.image} title={card.title} viewMode={viewMode} />
                                    ))}
                                </div>
                            </SortableContext>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <SortableContext items={cards.map((card) => card.id)} strategy={rectSortingStrategy}>
                                    {cards.map((card) => (
                                        <Card head_title={card.head_title} key={card.id} id={card.id} image={card.image} title={card.title} viewMode={viewMode} />
                                    ))}
                                </SortableContext>
                            </div>
                        )}

                        {cards.length === 0 && (
                            <div className="grid h-full min-h-[150px] place-items-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400 transition-all duration-200 group-hover:border-blue-300 group-hover:bg-blue-50/20 group-hover:text-blue-500">
                                Drop cards here
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Card({ id, title, head_title, image, isDragOverlay = false, viewMode = 'horizontal' }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({
        id,
        data: {
            type: 'Card',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        zIndex: isDragOverlay ? 999 : isDragging ? 100 : 'auto',
        opacity: isDragging && !isDragOverlay ? 0.5 : 1,
        willChange: isDragging ? 'transform' : 'auto',
    };

    return (
        <div>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`group relative cursor-grab rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:cursor-grabbing dark:bg-gray-600 p-2 dark:text-white ${
                    isDragOverlay ? 'cursor-grabbing border-2 border-blue-500 shadow-xl' : ''
                } ${over ? 'bg-blue-50/30 ring-2 ring-blue-400' : ''} ${viewMode === 'vertical' ? 'flex aspect-square h-20 min-h-[150px] w-full flex-col' : 'min-h-[100px]'}`}
            >
                {/* Delete button - only shows on hover */}
                {!isDragOverlay && (
                    <div className="absolute top-2 right-2 z-10 flex flex-col opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <ModalLink href={route('module.kanban.card.edit', { id: id })} className="rounded-full text-sm opacity-60 shadow-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-edit"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                <path d="M16 5l3 3" />
                            </svg>
                        </ModalLink>
                        <ModalLink
                            variant="danger"
                            size="xs"
                            href={route('module.kanban.card.confirm-delete', { id: id })}
                            className="rounded-full text-sm opacity-60 shadow-md"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 7l16 0" />
                                <path d="M10 11l0 6" />
                                <path d="M14 11l0 6" />
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            </svg>
                        </ModalLink>
                    </div>
                )}

                {/* Card content */}
                <div className={`flex h-full flex-col ${viewMode === 'vertical' ? 'justify-between' : ''}`}>
                    <div className={`overflow-scroll text-sm font-medium ${viewMode === 'vertical' ? '' : ''}`}>{title}</div>

                    {image && !title && (
                        <div className={`overflow-hidden rounded-md ${viewMode === 'vertical' ? 'flex-grow' : 'h-32'}`}>
                            <Link href={route('module.kanban.card.show', { card_id: id })}>
                                <img
                                    className="h-full w-full object-cover"
                                    src={image}
                                    alt={title}
                                    style={{
                                        aspectRatio: '1/1', // Ensures square aspect ratio
                                    }}
                                />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <h3 className="pt-1 text-xs">{head_title}</h3>
        </div>
    );
}
