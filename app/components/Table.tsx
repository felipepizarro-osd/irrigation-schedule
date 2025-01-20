'use client';
import * as React from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

type IrrigationSchedule = {
    plantName: string;
    frequency: number;
    duration: number;
    lastWatered: Date;
    color: string;
    [key: string]: string | number | Date;
};

const defaultData: IrrigationSchedule[] = [
    {
        plantName: 'Tomates',
        frequency: 2,
        duration: 2,
        lastWatered: new Date(2025, 0, 1),
        color: '#FFB7B7'
    },
    {
        plantName: 'Lechugas',
        frequency: 3,
        duration: 1,
        lastWatered: new Date(2025, 0, 2),
        color: '#B7FFB7'
    },
    {
        plantName: 'Zanahorias',
        frequency: 4,
        duration: 1.5,
        lastWatered: new Date(2025, 0, 3),
        color: '#FFE4B7'
    },
];

const columnHelper = createColumnHelper<IrrigationSchedule>();

function IrrigationTable() {
    const [data, setData] = React.useState(() => [...defaultData]);
    const rerender = React.useReducer(() => ({}), {})[1];
    const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
    const [inputStates, setInputStates] = React.useState<{ [key: string]: string }>({});

    const getDaysInMonth = () => {
        const date = new Date();
        return Array.from(
            { length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() },
            (_, i) => i + 1
        );
    };
    // Función para añadir nuevo fruto
    const addNewFruit = () => {
        const newFruit: IrrigationSchedule = {
            id: Date.now().toString(),
            plantName: 'Nuevo Fruto',
            frequency: 1,
            duration: 1,
            lastWatered: new Date(),
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        };
        setData([...data, newFruit]);
    };

    // Función para cambiar mes
    const changeMonth = (delta: number) => {
        setCurrentMonth(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };
    const shouldWater = (plant: IrrigationSchedule, day: number) => {
        const dayDate = new Date(2025, 0, day);
        const diffTime = Math.abs(dayDate.getTime() - plant.lastWatered.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays % plant.frequency === 0;
    };

    const baseColumns = [
        columnHelper.accessor('plantName', {
            cell: info => (
                <input
                    type="text"
                    value={inputStates[`${info.row.original.id}-name`] ?? info.getValue()}
                    onChange={e => {
                        setInputStates(prev => ({
                            ...prev,
                            [`${info.row.original.id}-name`]: e.target.value
                        }));
                    }}
                    onBlur={e => {
                        const newData = [...data];
                        newData[info.row.index].plantName = e.target.value;
                        setData(newData);
                    }}
                    className="w-32 p-2 border rounded"
                />
            ),
            header: () => 'Fruto',
        }),
        columnHelper.accessor('frequency', {
            cell: info => (
                <input
                    type="number"
                    value={info.getValue()}
                    onChange={e => {
                        const newData = [...data];
                        newData[info.row.index].frequency = Number(e.target.value);
                        setData(newData);
                    }}
                    className="w-0 p-1 border rounded"
                    min="1"
                />
            ),
            header: () => 'Frecuencia (días)',
            footer: info => info.column.id,
        }),
        columnHelper.accessor('duration', {
            cell: info => (
                <input
                    type="number"
                    value={info.getValue()}
                    onChange={e => {
                        const newData = [...data];
                        newData[info.row.index].duration = Number(e.target.value);
                        setData(newData);
                    }}
                    className="w-0 p-1 border rounded"
                    min="0.5"
                    step="0.5"
                />
            ),
            header: () => 'Duración (horas)',
            footer: info => info.column.id,
        }),
        columnHelper.accessor('lastWatered', {
            cell: info => (
                <input
                    type="date"
                    value={info.getValue().toISOString().split('T')[0]}
                    onChange={e => {
                        const newData = [...data];
                        newData[info.row.index].lastWatered = new Date(e.target.value);
                        setData(newData);
                    }}
                    className="p-1 border rounded"
                />
            ),
            header: () => 'Último Riego',
            footer: info => info.column.id,
        }),
        columnHelper.accessor('color', {
            cell: info => (
                <input
                    type="color"
                    value={info.getValue()}
                    onChange={e => {
                        const newData = [...data];
                        newData[info.row.index].color = e.target.value;
                        setData(newData);
                    }}
                    className="w-16 h-8 cursor-pointer"
                />
            ),
            header: () => 'Color',
            footer: info => info.column.id,
        }),
    ];

    const dayColumns = getDaysInMonth().map(day =>
        columnHelper.accessor(row => {
            const shouldWaterDay = shouldWater(row, day);
            return shouldWaterDay ? '💧' : '';
        }, {
            id: `day${day}`,
            header: () => day.toString(),
            cell: info => {
                const row = info.row.original;
                const shouldWaterDay = shouldWater(row, day);
                return (
                    <div
                        style={{
                            textAlign: 'center',
                            backgroundColor: shouldWaterDay ? row.color : 'transparent',
                            padding: '8px',
                            minWidth: '2rem'
                        }}
                    >
                        {shouldWaterDay ? '💧' : ''}
                    </div>
                );
            },
            footer: info => info.column.id,
        })
    );

    const columns = [...baseColumns, ...dayColumns];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-6">
            {/* Encabezado y Controles */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Calendario de Riego
                </h1>

                {/* Navegación entre meses */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        ← Mes Anterior
                    </button>

                    <span className="text-lg font-medium">
                        {currentMonth.toLocaleString('default', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </span>

                    <button
                        onClick={() => changeMonth(1)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Mes Siguiente →
                    </button>
                </div>
            </div>

            {/* Contenedor de la tabla con scroll horizontal */}
            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Cabecera de la tabla */}
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"
                                        style={{
                                            minWidth: header.column.id.startsWith('day') ? '3rem' : 'auto'
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    {/* Cuerpo de la tabla */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        className="px-6 py-4 text-sm text-gray-600"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Controles inferiores */}
            <div className="mt-6 flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        onClick={addNewFruit}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        + Añadir Fruto
                    </button>

                    <button
                        onClick={() => rerender()}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Actualizar Vista
                    </button>
                </div>

                {/* Leyenda o información adicional */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>💧 Día de riego</span>
                </div>
            </div>
        </div>

    );
}
export default IrrigationTable;