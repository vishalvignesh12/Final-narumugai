import { NextResponse } from 'next/server.js';

export function response(success, statusCode, message, data = {}) {
    const httpStatus = Number.isInteger(statusCode) && statusCode >= 100 && statusCode <= 599
        ? statusCode
        : 500;
    return NextResponse.json(
        { success, statusCode: httpStatus, message, data },
        { status: httpStatus }
    );
}

export function catchError(error, customMessage) {
    let httpStatus = 500;
    if (error.code === 11000) {
        httpStatus = 409;
        const keys = Object.keys(error.keyPattern || {}).join(',');
        error.message = keys
            ? `Duplicate fields: ${keys}. These fields value must be unique.`
            : 'A record with these values already exists.';
    } else if (['ValidationError', 'CastError', 'ZodError', 'SyntaxError'].includes(error.name)) {
        httpStatus = 400;
    }

    const errorBody = process.env.NODE_ENV === 'development'
        ? { message: error.message, error }
        : { message: customMessage || 'Internal server error.' };

    return NextResponse.json(
        { success: false, statusCode: httpStatus, ...errorBody },
        { status: httpStatus }
    );
}
