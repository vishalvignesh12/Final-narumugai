import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlineViewCarousel } from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { FaTrash } from "react-icons/fa";
import { ADMIN_BANNER_ADD, ADMIN_BANNER_SHOW, ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_AVAILABILITY, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_REVIEW_SHOW, ADMIN_TRASH } from "@/routes/AdminPanelRoute";


export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: AiOutlineDashboard
    },
    {
        title: "Product Availability",
        url: ADMIN_PRODUCT_AVAILABILITY,
        icon: TbPackage
    },
    {
        title: "Category",
        url: "#",
        icon: BiCategory,
        submenu: [
            {
                title: "Add Category",
                url: ADMIN_CATEGORY_ADD
            },
            {
                title: "All Category",
                url: ADMIN_CATEGORY_SHOW
            }
        ]
    },
    {
        title: "Products",
        url: "#",
        icon: IoShirtOutline,
        submenu: [
            {
                title: "Add Product",
                url: ADMIN_PRODUCT_ADD
            },
            {
                title: "Add Variant",
                url: ADMIN_PRODUCT_VARIANT_ADD
            },
            {
                title: "All Products",
                url: ADMIN_PRODUCT_SHOW
            },
            {
                title: "Product Variants",
                url: ADMIN_PRODUCT_VARIANT_SHOW
            },
            {
                title: "Product Availability",
                url: ADMIN_PRODUCT_AVAILABILITY
            },
        ]
    },
    {
        title: "Coupons",
        url: "#",
        icon: RiCoupon2Line,
        submenu: [
            {
                title: "Add Coupon",
                url: ADMIN_COUPON_ADD
            },
            {
                title: "All Coupons",
                url: ADMIN_COUPON_SHOW
            },

        ]
    },
    {
        title: "Banners",
        url: "#",
        icon: MdOutlineViewCarousel,
        submenu: [
            {
                title: "Add Banner",
                url: ADMIN_BANNER_ADD
            },
            {
                title: "All Banners",
                url: ADMIN_BANNER_SHOW
            }
        ]
    },
    {
        title: "Orders",
        url: ADMIN_ORDER_SHOW,
        icon: MdOutlineShoppingBag,

    },
    {
        title: "Customers",
        url: ADMIN_CUSTOMERS_SHOW,
        icon: LuUserRound,
    },
    {
        title: "Rating & Review",
        url: ADMIN_REVIEW_SHOW,
        icon: IoMdStarOutline,
    },
    {
        title: "Media",
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },
    {
        title: "Trash",
        url: ADMIN_TRASH,
        icon: FaTrash,
    },
]