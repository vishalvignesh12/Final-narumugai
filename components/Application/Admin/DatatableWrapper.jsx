'use client'

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/lib/materialTheme';
import Datatable from './Datatable';

const DatatableWrapper = ({
    queryKey,
    fetchUrl,
    columnsConfig,
    initialPageSize = 10,
    exportEndpoint,
    deleteEndpoint,
    deleteType,
    trashView,
    createAction
}) => {

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [muiTheme, setMuiTheme] = useState(lightTheme);

    // Set the proper Material-UI theme based on current theme
    useEffect(() => {
        setMuiTheme(resolvedTheme === 'dark' ? darkTheme : lightTheme);
        setMounted(true);
    }, [resolvedTheme]);

    if (!mounted) return null;

    return (
        <ThemeProvider theme={muiTheme}>
            <Datatable
                queryKey={queryKey}
                fetchUrl={fetchUrl}
                columnsConfig={columnsConfig}
                initialPageSize={initialPageSize}
                exportEndpoint={exportEndpoint}
                deleteEndpoint={deleteEndpoint}
                deleteType={deleteType}
                trashView={trashView}
                createAction={createAction}
            />
        </ThemeProvider>
    );
};

export default DatatableWrapper
