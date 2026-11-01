export function isProductInventoryLine(line) {
    return line.inventoryType === 'product' || !line.variantId || String(line.variantId) === 'null' || String(line.variantId).includes('fallback-');
}
