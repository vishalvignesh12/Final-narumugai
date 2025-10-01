export const adminOrderNotification = (data) => {
    const html = `
        <!DOCTYPE html>
        <html lang="en-US" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
        <head>
            <title>New Order Notification - Narumugai</title>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <style>
                * {
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }
                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                }
                p {
                    line-height: inherit
                }
                .desktop_hide, .desktop_hide table {
                    mso-hide: all;
                    display: none;
                    max-height: 0px;
                    overflow: hidden;
                }
                .image_block img+div {
                    display: none;
                }
                @media (max-width:700px) {
                    .mobile_hide {
                        display: none;
                    }
                    .row-content {
                        width: 100% !important;
                    }
                    .stack .column {
                        width: 100%;
                        display: block;
                    }
                }
            </style>
        </head>
        <body class="body" style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
            <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;" width="100%">
                <tbody>
                    <tr>
                        <td>
                            <!-- Header -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: linear-gradient(135deg, #ec4899, #f472b6); border-radius: 0 0 20px 20px; color: #000000; width: 680px; margin: 0 auto;" width="680">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding: 30px; vertical-align: top;" width="100%">
                                                            <h1 style="margin: 0; color: #ffffff; direction: ltr; font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; font-size: 28px; font-weight: bold; letter-spacing: -1px; line-height: 1.2; text-align: center; margin-top: 0; margin-bottom: 10px;">
                                                                🎉 NEW ORDER RECEIVED! 🎉
                                                            </h1>
                                                            <p style="margin: 0; color: #ffffff; text-align: center; font-size: 16px; opacity: 0.9;">
                                                                Order ID: <strong>${data.order_id}</strong>
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- Order Details -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; padding: 30px 60px; width: 680px; margin: 0 auto;" width="680">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top;" width="100%">
                                                            
                                                            <!-- Customer Information -->
                                                            <div style="background-color: #fdf2f8; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #ec4899;">
                                                                <h2 style="margin: 0 0 15px 0; color: #ec4899; font-size: 20px; font-weight: bold;">Customer Information</h2>
                                                                <table style="width: 100%; border-collapse: collapse;">
                                                                    <tr>
                                                                        <td style="padding: 5px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                                                                        <td style="padding: 5px 0; color: #6b7280;">${data.name}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="padding: 5px 0; font-weight: bold; color: #374151;">Email:</td>
                                                                        <td style="padding: 5px 0; color: #6b7280;">${data.email}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="padding: 5px 0; font-weight: bold; color: #374151;">Phone:</td>
                                                                        <td style="padding: 5px 0; color: #6b7280;">${data.phone}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="padding: 5px 0; font-weight: bold; color: #374151; vertical-align: top;">Address:</td>
                                                                        <td style="padding: 5px 0; color: #6b7280;">
                                                                            ${data.landmark}<br/>
                                                                            ${data.city}, ${data.state}<br/>
                                                                            ${data.country} - ${data.pincode}
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </div>

                                                            <!-- Order Items -->
                                                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #6366f1;">
                                                                <h2 style="margin: 0 0 15px 0; color: #6366f1; font-size: 20px; font-weight: bold;">Ordered Items</h2>
                                                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                                                                    <thead>
                                                                        <tr style="background-color: #f1f5f9;">
                                                                            <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151; border-bottom: 1px solid #e2e8f0;">Product</th>
                                                                            <th style="padding: 12px; text-align: center; font-weight: bold; color: #374151; border-bottom: 1px solid #e2e8f0;">Qty</th>
                                                                            <th style="padding: 12px; text-align: right; font-weight: bold; color: #374151; border-bottom: 1px solid #e2e8f0;">Price</th>
                                                                            <th style="padding: 12px; text-align: right; font-weight: bold; color: #374151; border-bottom: 1px solid #e2e8f0;">Total</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        ${data.products.map(product => `
                                                                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                                                                <td style="padding: 12px;">
                                                                                    <div style="font-weight: bold; color: #374151; margin-bottom: 4px;">${product.name}</div>
                                                                                    <div style="font-size: 12px; color: #6b7280;">Size: ${product.size} | Color: ${product.color}</div>
                                                                                </td>
                                                                                <td style="padding: 12px; text-align: center; color: #6b7280;">${product.qty}</td>
                                                                                <td style="padding: 12px; text-align: right; color: #6b7280;">₹${product.sellingPrice.toLocaleString('en-IN')}</td>
                                                                                <td style="padding: 12px; text-align: right; font-weight: bold; color: #374151;">₹${(product.sellingPrice * product.qty).toLocaleString('en-IN')}</td>
                                                                            </tr>
                                                                        `).join('')}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            <!-- Order Summary -->
                                                            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                                                                <h2 style="margin: 0 0 15px 0; color: #10b981; font-size: 20px; font-weight: bold;">Order Summary</h2>
                                                                <table style="width: 100%; border-collapse: collapse;">
                                                                    <tr>
                                                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subtotal:</td>
                                                                        <td style="padding: 8px 0; text-align: right; color: #6b7280;">₹${data.subtotal.toLocaleString('en-IN')}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Discount:</td>
                                                                        <td style="padding: 8px 0; text-align: right; color: #ef4444;">-₹${data.discount.toLocaleString('en-IN')}</td>
                                                                    </tr>
                                                                    ${data.couponDiscountAmount > 0 ? `
                                                                    <tr>
                                                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Coupon Discount:</td>
                                                                        <td style="padding: 8px 0; text-align: right; color: #ef4444;">-₹${data.couponDiscountAmount.toLocaleString('en-IN')}</td>
                                                                    </tr>
                                                                    ` : ''}
                                                                    <tr style="border-top: 2px solid #10b981; margin-top: 10px;">
                                                                        <td style="padding: 12px 0 8px 0; font-weight: bold; font-size: 18px; color: #374151;">Total Amount:</td>
                                                                        <td style="padding: 12px 0 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">₹${data.totalAmount.toLocaleString('en-IN')}</td>
                                                                    </tr>
                                                                </table>
                                                            </div>

                                                            <!-- Action Buttons -->
                                                            <div style="text-align: center; margin: 30px 0;">
                                                                <a href="${data.adminOrderUrl}" style="background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin: 0 10px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);">
                                                                    View Order Details
                                                                </a>
                                                                <a href="${data.adminDashboardUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin: 0 10px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
                                                                    Go to Dashboard
                                                                </a>
                                                            </div>

                                                            <!-- Order Notes -->
                                                            ${data.ordernote ? `
                                                            <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                                                                <h3 style="margin: 0 0 10px 0; color: #f59e0b; font-size: 16px; font-weight: bold;">Customer Notes:</h3>
                                                                <p style="margin: 0; color: #78716c; font-style: italic;">"${data.ordernote}"</p>
                                                            </div>
                                                            ` : ''}

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- Footer -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: linear-gradient(135deg, #374151, #4b5563); border-radius: 20px 20px 0 0; color: #000000; padding: 30px 60px; width: 680px; margin: 0 auto;" width="680">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top;" width="100%">
                                                            <div style="text-align: center;">
                                                                <p style="margin: 0; color: #fdf2f8; font-size: 14px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">
                                                                    NARUMUGAI ADMIN NOTIFICATION
                                                                </p>
                                                                <p style="margin: 0; color: #d1d5db; font-size: 12px;">
                                                                    This notification was sent automatically when a new order was placed.
                                                                </p>
                                                                <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 12px;">
                                                                    <strong>Narumugai Boutique</strong> | <a href="https://narumugaiboutique.com" style="color: #ec4899; text-decoration: none;">https://narumugai.com</a>
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
    `;

    return html;
};