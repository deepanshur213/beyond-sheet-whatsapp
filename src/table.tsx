import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "./components/ui/label"
import Range from "./components/range"
import { DatePickerWithRange } from "./components/date-range"

import { isAfter, isBefore } from 'date-fns'

export type Data = {
    source: string
    date: string
    name: string
    number: string
    no_of_seats: string
    requirement: string
    location: string
    budget_per_seat: string
    visit_planned: string
    visit1: string
    status: string
    remarks: string
}

export const columns: ColumnDef<Data>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
            <div className="capitalize">{row.original.source}</div>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <div>{row.original.date}</div>,
        filterFn: (row, _, filterValue) => {
            const [min, max] = JSON.parse(filterValue)
            return (
                isAfter(row.original.date, min) && isBefore(row.original.date, max)
            )
        }
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="capitalize">{row.original.name}</div>,
    },
    {
        accessorKey: "number",
        header: "Number",
        cell: ({ row }) => <div>{row.original.number}</div>,
    },
    {
        accessorKey: "no_of_seats",
        header: "No. of Seats",
        cell: ({ row }) => <div>{row.original.no_of_seats}</div>,
        filterFn: (row, _, filterValue) => {
            const [min, max] = JSON.parse(filterValue)
            return (
                row.original.no_of_seats >= min && row.original.no_of_seats <= max
            )
        },
    },
    {
        accessorKey: "requirement",
        header: "Requirement",
        cell: ({ row }) => <div>{row.original.requirement}</div>,
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => <div>{row.original.location}</div>,
    },
    {
        accessorKey: "budget_per_seat",
        header: "Budget per Seat",
        cell: ({ row }) => <div>{row.original.budget_per_seat}</div>,
        filterFn: (row, _, filterValue) => {
            const [min, max] = JSON.parse(filterValue)
            return (
                row.original.budget_per_seat >= min && row.original.budget_per_seat <= max
            )
        },
    },
    {
        accessorKey: "visit_planned",
        header: "Visit Planned",
        cell: ({ row }) => <div>{row.original.visit_planned}</div>,
        filterFn: (row, _, filterValue) => {
            const [min, max] = JSON.parse(filterValue)
            return (
                isAfter(row.original.visit_planned, min) && isBefore(row.original.visit_planned, max)
            )
        }
    },
    {
        accessorKey: "visit1",
        header: "Visit 1",
        cell: ({ row }) => <div>{row.original.visit1}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <div>{row.original.status}</div>,
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <div>{row.original.remarks}</div>,
    }
]

export function DataTable({ data }: { data: Data[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    console.log(Array.from(table.getColumn('status')?.getFacetedUniqueValues().keys()!))

    return (
        <div className="w-full mt-5">
            <div className="flex flex-wrap gap-5">
                <div className="text-center">
                    <Label>Source</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="flex">
                            <Button variant="outline">
                                {table.getColumn('source')?.getFilterValue() as string || 'All'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* @ts-ignore */}
                            {Array.from(table.getColumn('source')?.getFacetedUniqueValues().keys())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column}
                                            className="capitalize"
                                            checked={table.getColumn('source')?.getFilterValue() == column}
                                            onCheckedChange={(value) => {
                                                if (value == column) {
                                                    table.getColumn('source')?.setFilterValue('')
                                                } else {
                                                    table.getColumn('source')?.setFilterValue(column)
                                                }
                                            }
                                            }
                                        >
                                            {column || 'all'}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="text-center">
                    <Label>Date</Label>
                    <DatePickerWithRange value={table.getColumn('date')?.getFilterValue() as string} onChange={(v) => table.getColumn('date')?.setFilterValue(v)} />
                </div>

                <div className="text-center">
                    <Label>Requirement</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="flex">
                            <Button variant="outline">
                                {table.getColumn('requirement')?.getFilterValue() as string || 'All'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* @ts-ignore */}
                            {Array.from(table.getColumn('requirement')?.getFacetedUniqueValues().keys())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column}
                                            className="capitalize"
                                            checked={table.getColumn('requirement')?.getFilterValue() == column}
                                            onCheckedChange={(value) => {
                                                if (value == column) {
                                                    table.getColumn('requirement')?.setFilterValue('')
                                                } else {
                                                    table.getColumn('requirement')?.setFilterValue(column)
                                                }
                                            }
                                            }
                                        >
                                            {column || 'all'}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="text-center">
                    <Label>Location</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="flex">
                            <Button variant="outline">
                                {table.getColumn('location')?.getFilterValue() as string || 'All'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* @ts-ignore */}
                            {Array.from(table.getColumn('location')?.getFacetedUniqueValues().keys())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column}
                                            className="capitalize"
                                            checked={table.getColumn('location')?.getFilterValue() == column}
                                            onCheckedChange={(value) => {
                                                if (value == column) {
                                                    table.getColumn('location')?.setFilterValue('')
                                                } else {
                                                    table.getColumn('location')?.setFilterValue(column)
                                                }
                                            }
                                            }
                                        >
                                            {column || 'all'}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="text-center">
                    <Label>Number of Seats</Label>
                    <Range minv={table.getColumn('no_of_seats')?.getFacetedMinMaxValues()?.[0]} maxv={table.getColumn('no_of_seats')?.getFacetedMinMaxValues()?.[1]} value={table.getColumn('no_of_seats')?.getFilterValue() as string} onChange={(v) => table.getColumn('no_of_seats')?.setFilterValue(v)} />
                </div>

                <div className="text-center">
                    <Label>Budget per Seat</Label>
                    <Range minv={table.getColumn('budget_per_seat')?.getFacetedMinMaxValues()?.[0]} maxv={table.getColumn('budget_per_seat')?.getFacetedMinMaxValues()?.[1]} value={table.getColumn('budget_per_seat')?.getFilterValue() as string} onChange={(v) => table.getColumn('budget_per_seat')?.setFilterValue(v)} />
                </div>

                <div className="text-center">
                    <Label>Visit Planned</Label>
                    <DatePickerWithRange value={table.getColumn('visit_planned')?.getFilterValue() as string} onChange={(v) => table.getColumn('visit_planned')?.setFilterValue(v)} />
                </div>

                <div className="text-center">
                    <Label>Status</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="flex">
                            <Button variant="outline">
                                {table.getColumn('status')?.getFilterValue() as string || 'All'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* @ts-ignore */}
                            {Array.from(table.getColumn('status')?.getFacetedUniqueValues().keys())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column}
                                            className="capitalize"
                                            checked={table.getColumn('status')?.getFilterValue() == column}
                                            onCheckedChange={(value) => {
                                                if (value == column) {
                                                    table.getColumn('status')?.setFilterValue('')
                                                } else {
                                                    table.getColumn('status')?.setFilterValue(column)
                                                }
                                            }
                                            }
                                        >
                                            {column || 'all'}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-end">
                    <Button
                        onClick={() => {
                            window.location.reload()
                        }}
                    >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Refresh
                    </Button>
                </div>

            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter by remarks..."
                    value={(table.getColumn("remarks")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("remarks")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <div className="inline">
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
            <div>Selected: {table.getSelectedRowModel().rows.length}</div>
        </div>
    )
}
