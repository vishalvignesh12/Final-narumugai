const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[character])

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})

const safeLink = (value) => {
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '#'
    } catch {
        return '#'
    }
}

export const adminOrderNotification = (data) => {
    const orderId = escapeHtml(data.order_id || 'Unknown')
    const products = Array.isArray(data.products) ? data.products : []
    const productRows = products.map(product => `
        <tr>
            <td style="padding:12px;border-bottom:1px solid #eee">${escapeHtml(product.name || 'Product')}</td>
            <td style="padding:12px;border-bottom:1px solid #eee">${escapeHtml(product.size || '—')}</td>
            <td style="padding:12px;border-bottom:1px solid #eee">${escapeHtml(product.color || '—')}</td>
            <td style="padding:12px;text-align:center;border-bottom:1px solid #eee">${escapeHtml(product.qty || 0)}</td>
            <td style="padding:12px;text-align:right;border-bottom:1px solid #eee">₹${formatAmount(product.sellingPrice)}</td>
            <td style="padding:12px;text-align:right;border-bottom:1px solid #eee">₹${formatAmount(Number(product.sellingPrice || 0) * Number(product.qty || 0))}</td>
        </tr>
    `).join('')

    return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Narumugai order</title></head>
<body style="margin:0;background:#f8f7f5;color:#292524;font-family:Arial,Helvetica,sans-serif">
  <main style="max-width:680px;margin:24px auto;padding:24px;background:#fff;border:1px solid #eee;border-radius:12px">
    <h1 style="margin:0 0 8px;color:#9d174d;font-size:24px">New order received</h1>
    <p style="margin:0 0 24px;color:#57534e">Order <strong>${orderId}</strong> has been paid and is ready for processing.</p>
    <h2 style="font-size:17px">Customer</h2>
    <p style="line-height:1.7">${escapeHtml(data.name)}<br>${escapeHtml(data.email)}<br>${escapeHtml(data.phone)}<br>${escapeHtml(data.landmark)}, ${escapeHtml(data.city)}, ${escapeHtml(data.state)} ${escapeHtml(data.pincode)}, ${escapeHtml(data.country)}</p>
    <h2 style="font-size:17px">Items</h2>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px;text-align:left">
      <thead><tr style="background:#fdf2f8"><th style="padding:12px">Product</th><th style="padding:12px">Size</th><th style="padding:12px">Color</th><th style="padding:12px">Qty</th><th style="padding:12px;text-align:right">Price</th><th style="padding:12px;text-align:right">Total</th></tr></thead>
      <tbody>${productRows}</tbody>
    </table></div>
    <table style="width:100%;margin-top:20px;border-collapse:collapse">
      <tr><td style="padding:6px">Subtotal</td><td style="padding:6px;text-align:right">₹${formatAmount(data.subtotal)}</td></tr>
      <tr><td style="padding:6px">Discount</td><td style="padding:6px;text-align:right">−₹${formatAmount(data.discount)}</td></tr>
      <tr><td style="padding:6px">Coupon discount</td><td style="padding:6px;text-align:right">−₹${formatAmount(data.couponDiscountAmount)}</td></tr>
      <tr><td style="padding:10px 6px;font-weight:bold;border-top:1px solid #ddd">Paid total</td><td style="padding:10px 6px;text-align:right;font-weight:bold;border-top:1px solid #ddd">₹${formatAmount(data.totalAmount)}</td></tr>
    </table>
    ${data.ordernote ? `<p style="padding:12px;background:#fafaf9;border-radius:8px"><strong>Order note:</strong> ${escapeHtml(data.ordernote)}</p>` : ''}
    <p style="margin:24px 0"><a href="${safeLink(data.adminOrderUrl)}" style="display:inline-block;padding:12px 18px;background:#9d174d;color:#fff;text-decoration:none;border-radius:8px">View order</a> <a href="${safeLink(data.adminDashboardUrl)}" style="margin-left:8px;color:#9d174d">Admin orders</a></p>
    <p style="margin:0;color:#78716c;font-size:12px">Automated notification from Narumugai Boutique.</p>
  </main>
</body>
</html>`
}
