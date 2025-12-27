import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
    _id: string,
    name: string,
    price: number,
    quantity: number,
    image: string,
    vendorId: string
}

interface CartContextType {
    cartItems: CartItem[],
    addToCart: (product: any) => void,
    removeFromCart: (productId: string) => void,
    decreaseQuantity: (productId: string) => void,
    clearCart: () => void,
    getCartTotal: () => number,
    getCartItemsCount: () => number,
}

const cartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem("bitebridge_cart");
        return savedCart ? JSON.parse(savedCart) : [];
    })

    useEffect(() => {
        localStorage.setItem("bitebridge_cart", JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (product: any) => {
        setCartItems((prevItems) => {
            // check: agar user dusre vendor se order kr raha hai to cart ko clear krke newly add krega
            if (prevItems.length > 0 && prevItems[0].vendorId !== product.vendorId) {
                return [{
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    vendorId: product.vendorId,
                    image: product.fullImageUrl,
                }]
            }

            const existingItem = prevItems.find((item) => item._id === product._id)
            //handling same item : agar same hai to sirf quantity increase aur agar new Item hai to add fully items
            if (existingItem) {
                return prevItems.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            else {
                return [
                    ...prevItems,
                    {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        vendorId: product.vendorId, // Make sure product object has vendorId
                        image: product.fullImageUrl
                    }
                ]
            }
        })
    }

    const decreaseQuantity = (productId: string) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => item._id === productId ? { ...item, quantity: item.quantity - 1 } : item)
                .filter((item) => item.quantity > 0) // zero quantity wale ko hatane ke liye
        )
    }

    const removeFromCart = (productId: string) => {
        setCartItems((prevItems) => prevItems.filter(item => item._id !== productId))
    }

    const clearCart = () => setCartItems([])

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0)
    }

    return (
        <cartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                decreaseQuantity,
                clearCart,
                getCartTotal,
                getCartItemsCount,
            }}
        >
            {children}
        </cartContext.Provider>
    )

}

export const useCart = () => {
    const context = useContext(cartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}