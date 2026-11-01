# API reference

The application API is implemented as Next.js App Router route handlers in `app/api`. All paths below are relative to `/api`. The table records route files and exported HTTP methods; it does not imply that every route is public. Authentication and validation differ by handler. Middleware gates `/api/v2/*` behind `ENABLE_V2_API`; legacy Mongo routes must enforce authentication and validation in each handler.

## Authentication and conventions

Page authentication uses a JWT in the `access_token` cookie, verified with `SECRET_KEY`. Customers sign in with email/password and an emailed OTP. Registration email verification also uses an emailed OTP; password recovery uses a one-time email link. SMS OTP authentication has been removed. Protected browser requests should use same-origin cookies. API handlers commonly accept JSON request bodies and return JSON, while PayU verification may redirect to success/failure pages. Exact fields and response shapes are defined in each route file.

These descriptions apply to the legacy API unless a route is explicitly marked V2. The MongoDB/JWT API is the active storefront path. V2 routes use the PostgreSQL-backed session cookie and are blocked by middleware unless `ENABLE_V2_API=true`.

## Routes

| Methods | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Register account. |
| POST | `/auth/login` | Authenticate account. |
| POST | `/auth/verify-otp` | Verify email sign-in or email-verification code. |
| GET | `/auth/session` | Resolve the current JWT cookie to a minimal user summary for the browser. |
| POST | `/auth/resend-otp` | Resend an email sign-in or email-verification code. |
| POST | `/auth/logout` | Clear session/authentication cookie. |
| POST | `/auth/verify-email` | Verify email flow. |
| POST | `/auth/reset-password/send-link` | Send a password reset link. |
| PUT | `/auth/reset-password/update-password` | Set replacement password. |
| GET | `/profile/get` | Read profile. |
| PUT | `/profile/update` | Update profile. |
| POST | `/profile/change-password` | Change password. |
| GET | `/dashboard/user` | Customer dashboard data. |
| GET, POST, PUT, DELETE | `/cart` | Read and mutate cart. |
| POST | `/cart-verification` | Validate cart/order inputs before checkout. |
| GET | `/user-order` | Read customer orders. |
| GET | `/orders` | Admin order listing. |
| GET | `/orders/get/[orderid]` | Read a specific order. |
| PUT | `/orders/cancel` | Cancel an order. |
| PUT, DELETE | `/orders/delete` | Delete order record(s). |
| PUT | `/orders/update-status` | Change order status. |
| GET | `/orders/export` | Export orders. |
| POST | `/payment/initiate-payment` | Create PayU payment request. |
| POST | `/payment/verify` | Verify PayU response and continue order flow. |
| POST | `/stock/lock` | Reserve/lock stock for checkout. |
| POST | `/stock/unlock` | Release a stock lock. |
| POST | `/stock/atomic-purchase` | Atomically decrement available stock. |
| GET | `/product` | Product listing/query endpoint. |
| POST | `/product/create` | Create product. |
| PUT | `/product/update` | Update product. |
| PUT, DELETE | `/product/delete` | Soft-delete/delete product operation. |
| GET | `/product/get/[id]` | Fetch product by identifier. |
| GET | `/product/details/[slug]` | Fetch product by slug. |
| GET | `/product/get-featured-product` | Fetch featured products. |
| GET, PATCH | `/product/availability` | Read/update product availability. |
| GET | `/product/price-range` | Get catalog price range. |
| GET | `/product/export` | Export products. |
| GET | `/product-variant` | List/query variants. |
| POST | `/product-variant/create` | Create variant. |
| PUT | `/product-variant/update` | Update variant. |
| PUT, DELETE | `/product-variant/delete` | Delete variant. |
| GET | `/product-variant/get/[id]` | Get variant by identifier. |
| GET | `/product-variant/sizes` | List available sizes. |
| GET | `/product-variant/colors` | List available colors. |
| GET | `/product-variant/export` | Export variants. |
| GET | `/category` | List categories. |
| GET | `/category/get-category` | Retrieve category data used by storefront/admin. |
| GET | `/category/get/[id]` | Get category by identifier. |
| POST | `/category/create` | Create category. |
| PUT | `/category/update` | Update category. |
| PUT, DELETE | `/category/delete` | Delete category. |
| GET | `/category/export` | Export categories. |
| GET | `/shop` | Read shop listing data. |
| POST | `/shop` | Shop query/action handler. |
| POST | `/coupon/apply` | Validate/apply coupon. |
| GET | `/coupon` | List coupons. |
| POST | `/coupon/create` | Create coupon. |
| PUT | `/coupon/update` | Update coupon. |
| GET | `/coupon/get/[id]` | Get coupon by identifier. |
| PUT, DELETE | `/coupon/delete` | Delete coupon. |
| GET | `/coupon/export` | Export coupons. |
| GET | `/review` | List/review query. |
| POST | `/review/create` | Create review. |
| GET | `/review/get` | Fetch reviews. |
| GET | `/review/details` | Fetch review details/summary. |
| PUT, DELETE | `/review/delete` | Delete review. |
| GET | `/review/export` | Export reviews. |
| GET | `/customers` | List customers. |
| PUT, DELETE | `/customers/delete` | Delete customer. |
| GET | `/customers/export` | Export customers. |
| GET | `/dashboard/admin/count` | Admin dashboard counts. |
| GET | `/dashboard/admin/latest-order` | Latest order summary. |
| GET | `/dashboard/admin/latest-review` | Latest review summary. |
| GET | `/dashboard/admin/monthly-sales` | Monthly sales data. |
| GET | `/dashboard/admin/order-status` | Order status breakdown. |
| GET | `/media` | List media. |
| POST | `/media/create` | Create media record. |
| PUT | `/media/update` | Update media record. |
| DELETE | `/media/delete` | Delete media. |
| GET | `/media/get/[id]` | Get media by identifier. |
| POST | `/cloudinary-signature` | Sign Cloudinary upload parameters. |
| GET | `/banners/get` | List banners. |
| GET | `/banners/get/[id]` | Get banner by identifier. |
| GET | `/banners/get/position` | Get banners by position. |
| GET | `/banners/get/position/[position]` | Get banners for a position. |
| POST | `/banners/create` | Create banner. |
| PUT | `/banners/update` | Update banner. |
| PUT, DELETE | `/banners/delete` | Delete banner. |
| GET | `/carousels/get` | List carousels. |
| GET | `/carousels/get/[id]` | Get carousel by identifier. |
| POST | `/carousels/create` | Create carousel. |
| PUT | `/carousels/update` | Update carousel. |
| PUT, DELETE | `/carousels/delete` | Delete carousel. |
| GET | `/test` | Test/debug endpoint. |
| POST | `/faker/product` | Generate/test product data. |
| GET | `/debug/products` | Debug product data. |
| GET | `/debug/stock-status` | Inspect stock state. |
| POST | `/debug/migrate-quantity` | Debug/migration operation for quantity fields. |

## V2 routes

| Methods | Path | Purpose |
|---|---|---|
| GET, DELETE | `/v2/auth/session` | Read the signed-in state or revoke the current PostgreSQL-backed session. |
| GET, PATCH | `/v2/users/me` | Read or update the authenticated user's profile. PATCH accepts `displayName` and/or `email`; send `email: null` to clear it. |
| GET, POST | `/v2/users/me/addresses` | List or create India-only delivery addresses for the authenticated user. New addresses are not default unless `isDefault: true` is explicitly sent. |
| PATCH, DELETE | `/v2/users/me/addresses/{addressId}` | Update or delete an address owned by the authenticated user. PATCH can set `isDefault`; deleting the default leaves no default selected. |
| GET | `/v2/products`, `/v2/products/{slug}`, `/v2/categories` | Public PostgreSQL catalog with bounded pagination, search, category/featured filters, and allowlisted sorting. |
| GET, PUT, DELETE | `/v2/cart`, `/v2/cart/items/{variantId}` | Read or change a user cart or a guest cart identified by a Secure, HttpOnly opaque cookie. `PUT` accepts `{ "quantity": 1 }`, bounded to 1–20. |
| POST | `/v2/cart` | Merge the guest cart into the signed-in user's cart; also claims guest orders tied to the guest token. |
| GET | `/v2/wishlist` | Read the authenticated user's product-level wishlist. |
| PUT, DELETE | `/v2/wishlist/items/{productId}` | Add or remove a product from the authenticated user's wishlist. |
| POST | `/v2/coupons/validate` | Advisory coupon preview derived from the server cart; checkout recalculates it. |
| POST | `/v2/checkout` | Create an idempotent pending order, reserve inventory, and return PayU form fields. Prices, quantities, and order state come from PostgreSQL. |
| POST | `/v2/payments/payu/callback` | Verify the PayU response hash and transaction amount, deduplicate callbacks, and finalize or release a reservation. |
| GET | `/v2/orders`, `/v2/orders/{orderNumber}` | Read only orders owned by the current user or the matching guest-cart token. |
| POST | `/v2/orders/{orderNumber}` | Request cancellation. Paid order requests wait for admin-reviewed refund handling. |
| GET, POST | `/v2/admin/categories`, `/v2/admin/products`, `/v2/admin/coupons` | Admin-only category, product/variant/inventory creation, and coupon management. Mutations create audit records. |
| PATCH | `/v2/admin/categories/{id}`, `/v2/admin/products/{id}`, `/v2/admin/inventory/{variantId}`, `/v2/admin/coupons/{id}`, `/v2/admin/users/{id}`, `/v2/admin/orders/{id}` | Admin-only state changes with validation and audit records. Refund completion requires an operator-confirmed provider reference; inventory restocking is an explicit approval. |
| POST | `/v2/operations/reservations/expire` | Scheduled PayU status reconciliation, authenticated with `Authorization: Bearer $RESERVATION_EXPIRY_SECRET`. Unresolved payments retain their stock reservation. |

Address create/update inputs use `recipientName`, `phone`, `line1`, optional nullable `line2` and `landmark`, `city`, `state`, and `postalCode`. `phone` must be `+91` plus a valid 10-digit Indian mobile number; `postalCode` must be a six-digit Indian PIN. `countryCode` and `userId` are server-controlled and rejected from request bodies. `isDefault` is optional and defaults to `false`; set it to `true` explicitly to select a default.

Password reset requests accept an email address and send a one-time link valid for 30 minutes. The update endpoint accepts the link token and a new password; tokens are stored as hashes and consumed once.

## Payload details

The method/path inventory is generated from route exports. Request properties, query parameters, validation rules, status codes, and response JSON vary by route and should be read directly from the linked implementation under `app/api`. Public stock mutation routes, the sample-data endpoint, and the one-off quantity migration endpoint return 410. Debug product and stock reads require admin authentication.
