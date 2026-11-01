export function clampQty(requested, available) {
    const qty = Math.max(0, Number(requested) || 0)
    const stock = Math.max(0, Number(available) || 0)
    return Math.min(qty, stock)
}

export function mapVerifiedLine({ source, dbLine }) {
    const isVariant = dbLine.inventoryType === 'variant'
    return {
        productId: dbLine.productId,
        variantId: isVariant ? dbLine.variantId : null,
        name: dbLine.name,
        url: dbLine.url,
        size: dbLine.size,
        color: dbLine.color,
        mrp: dbLine.mrp,
        sellingPrice: dbLine.sellingPrice,
        media: dbLine.media,
        qty: clampQty(source.qty, dbLine.available)
    }
}
