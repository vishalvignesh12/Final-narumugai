import { catchError, response } from "@/lib/helperFunction"
import CategoryModel from "@/models/Category.model"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import UserModel from "@/models/User.model"
import { connectDB } from "@/lib/databaseConnection"

export async function GET() {
    try {
        await connectDB();

        // 1. Total Revenue (Unchanged - only counts 'delivered')
        const totalRevenue = await OrderModel.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])

        // 2. Total Orders (FIX: Filter out 'unverified' and 'cancelled' orders)
        const totalOrders = await OrderModel.countDocuments({
            status: { $nin: ['unverified', 'cancelled'] }
        });

        // 3. Total Customers (Unchanged)
        const totalCustomers = await UserModel.countDocuments({ role: 'user' });

        // 4. Total Products (FIX: Filter out soft-deleted products)
        const totalProducts = await ProductModel.countDocuments({
            deletedAt: null
        });

        // 5. Total Categories (FIX: Filter out soft-deleted categories)
        const totalCategories = await CategoryModel.countDocuments({
            deletedAt: null
        });

        const data = {
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            order: totalOrders,
            customer: totalCustomers,
            product: totalProducts,
            category: totalCategories
        }

        return response(true, 200, "Dashboard count retrieved", data)
    } catch (error) {
        return catchError(error)
    }
}