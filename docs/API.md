# API reference

The application API is implemented as Next.js App Router route handlers in `app/api`. All paths below are relative to `/api`. The table records route files and exported HTTP methods; it does not imply that every route is public. Authentication and validation differ by handler.

## Authentication and conventions

Page authentication uses a JWT in the `access_token` cookie, verified with `SECRET_KEY`. Customers sign in with email/password and an emailed OTP. Registration email verification also uses an emailed OTP; password recovery uses a one-time email link. SMS OTP authentication has been removed. Protected browser requests should use same-origin cookies. API handlers commonly accept JSON request bodies and return JSON, while PayU verification may redirect to success/failure pages. Exact fields and response shapes are defined in each route file.

These descriptions apply to the MongoDB/JWT storefront API.

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

Password reset requests accept an email address and send a one-time link valid for 30 minutes. The update endpoint accepts the link token and a new password; tokens are stored as hashes and consumed once.

## Payload details

The method/path inventory is generated from route exports. Request properties, query parameters, validation rules, status codes, and response JSON vary by route and should be read directly from the linked implementation under `app/api`. Public stock mutation routes, the sample-data endpoint, and the one-off quantity migration endpoint return 410. Debug product and stock reads require admin authentication.
