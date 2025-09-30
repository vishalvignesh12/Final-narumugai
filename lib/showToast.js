import { Bounce, toast } from "react-toastify"

export const showToast = (type, message) => {
    let options = {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    }

    switch (type) {
        case 'info':
            toast.info(message, options)
            break;
        case 'success':
            toast.success(message, options)
            break;
        case 'warning':
            toast.warning(message, options)
            break;
        case 'error':
            toast.error(message, options)
            break;
        default:
            toast(message, options)
            break;
    }
}