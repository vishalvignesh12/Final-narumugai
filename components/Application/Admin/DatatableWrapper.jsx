'use client'
import React, { useMemo } from 'react'
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton } from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { ADMIN_TRASH } from '@/routes/AdminPanelRoute';

// This is the main datatable component
const Datatable = ({ columns, data, addNew, deleteType, trashView }) => {
    const router = useRouter()

    const columnsConfig = useMemo(() => columns, [columns])

    // Handle delete
    const handleDelete = async (row) => {
        if (confirm(`Are you sure you want to delete this ${deleteType}?`)) {
            try {
                const { data } = await axios.delete(`/api/${deleteType.toLowerCase()}/delete`, {
                    params: { id: row.original._id }
                })
                if (data.success) {
                    showToast('success', data.message)
                    router.refresh()
                }
            } catch (error) {
                showToast('error', error.response ? error.response.data.message : error.message)
            }
        }
    }

    // init table
    const table = useMaterialReactTable({

        // --- THIS WAS THE ERROR ---
        // Your code had 'columns: columnsConfig' but the prop is 'columns'.
        // We'll use the 'columns' prop directly.
        columns: columns,
        // --- END OF FIX ---

        data,
        enableRowSelection: true,
        enableColumnOrdering: true,
        enableGlobalFilter: true,

        // render actions
        renderRowActions: ({ row }) => (
            <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                <IconButton
                    color="primary"
                    onClick={() => router.push(`${window.location.pathname}/edit/${row.original._id}`)}
                >
                    <EditIcon />
                </IconButton>
                <IconButton
                    color="error"
                    onClick={() => handleDelete(row)}
                >
                    <DeleteIcon />
                </IconButton>
                {
                    row.original.order_id &&
                    <IconButton
                        color="secondary"
                        onClick={() => router.push(`${window.location.pathname}/details/${row.original.order_id}`)}
                    >
                        <VisibilityIcon />
                    </IconButton>
                }
            </Box>
        ),

        // top toolbar
        renderTopToolbarCustomActions: () => (
            <div className='flex gap-2'>
                {
                    addNew &&
                    <Button
                        variant="contained"
                        onClick={() => router.push(addNew)}
                    >
                        Add New
                    </Button>
                }
                {
                    trashView &&
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => router.push(trashView)}
                    >
                        Trash
                    </Button>
                }
            </div>
        )
    });

    return (
        <MaterialReactTable table={table} />
    )
}

export default Datatable