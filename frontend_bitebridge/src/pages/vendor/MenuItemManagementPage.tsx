import { useEffect, useState, type MouseEvent, type KeyboardEvent, type ChangeEvent, type FormEvent } from 'react'
import axiosClient from '../../services/axiosClient'
import type { iCategory } from '../../types/category'
import toast from 'react-hot-toast'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Image as ImageIcon,
    Filter,
    CheckSquare,
} from 'lucide-react';

// type imageStyleType = {
//     width: string,
//     height: string,
//     objectFit: "cover" | "contain" | "fill" 
// }

// const imageSize: imageStyleType = {
//     width: "100px",
//     height: "100px",
//     objectFit: "fill"
// }

type CategoryApiResponse = {
    message: string,
    categories?: iCategory[],
    error?: string
}

type IMenuItemDisplay = {
    id: string,
    name: string,
    price: string,
    categoryId: iCategory
    availability: boolean
    fullImageUrl: string | null,
    isveg: boolean,
}
type IMenuItemForm = {
    id: string | null,
    name: string,
    price: string,
    category: string,
    fullImageUrl: string | null,
    availability: boolean,
    isveg: boolean,
}

type MenuApiResponse = {
    message: string;
    allMenuItems: IMenuItemDisplay[];
}

function MenuItemManagementPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [categories, setCategories] = useState<iCategory[]>([])

    const [categoryfilter, setCategoryFilter] = useState<string>('All')

    const [menuItems, setMenuItems] = useState<IMenuItemDisplay[]>([])

    const [filteredItems, setFilterdItems] = useState<IMenuItemDisplay[]>([])

    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])


    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editModal, setEditModal] = useState<boolean>(false)

    const [itemPhoto, setItemPhoto] = useState<File | null>(null)

    const [modalFormData, setModalFormData] = useState<IMenuItemForm>({
        id: null,
        name: '',
        price: '',
        availability: false,
        isveg: true,
        category: '',
        fullImageUrl: null,
    })

    useEffect(() => {
        const fetchCategory = async function () {
            try {
                const { data } = await axiosClient.get<CategoryApiResponse>('/vendors/get-all-categories')
                if (data.categories && data.categories.length > 0) {
                    setCategories(data?.categories)
                    console.log(data.categories);

                }
            } catch (error) {
                console.error("Error fetching categories", error)
            }
        }; fetchCategory()
    }, [])


    const fetchMenuItems = async function () {
        try {
            const { data } = await axiosClient.get<MenuApiResponse>('/vendors/get-all-menu-items')
            setMenuItems(data.allMenuItems || [])
            console.log(data);
        }
        catch (error) {
            console.error("Error fetching categories", error)
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, [])

    useEffect(() => {
        let result = menuItems
        // for Category wise filtering menuItems
        if (categoryfilter.toLowerCase() !== 'all') {
            result = result.filter(item => item.categoryId?.name.toLowerCase() === categoryfilter.toLowerCase())

        }
        // for name wise filtering menuItems
        if (debouncedSearch.trim() !== "") {
            result = result.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
        }
        setSelectedItemIds([])
        setFilterdItems(result)
    }, [menuItems, categoryfilter, debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 350
        );
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCategoryFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setCategoryFilter(e.target.value)
        console.log(categoryfilter)
    }

    const handleSearchQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)

    }
    const handleAddClick = (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        setEditModal(false)
        setIsModalOpen(true)
        setModalFormData({
            id: null,
            name: '',
            price: '',
            availability: false,
            isveg: true,
            category: '',
            fullImageUrl: null,
        });
    }
    const handleEditClick = (item: IMenuItemDisplay, e: MouseEvent<HTMLButtonElement>) => {
        console.log("Edit Item Data:", item);
        e.preventDefault();
        e.stopPropagation()
        setEditModal(true)
        setModalFormData({
            id: item.id,
            name: item.name,
            price: item.price,
            availability: item.availability,
            isveg: item.isveg,
            category: item.categoryId ? item.categoryId._id : "", //agar backend se hi category null aayi to us case me Optional Chaining safe rakhega frontend ko crash hone se
            fullImageUrl: item.fullImageUrl,
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) {
            return;
        }
        try {
            const response = await axiosClient.delete(`vendors/delete-menu-item/${id}`)
            if (response.status === 200) {
                setMenuItems((prev) => (prev.filter(item => item.id !== id)))
            }
        } catch (err: any) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Failed to delete item");
        }
    }

    const handleSelectDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) {
            return;
        }

        const dataToSend = {
            menuItemIds: [...selectedItemIds]
        }
        try {
            const response = await axiosClient.delete('vendors/delete-many-menu-item/', { data: dataToSend })
            toast.success(`${selectedItemIds.length} item(s) has been deleted`)
            if (response.status === 200) {
                setSelectedItemIds([]);
                fetchMenuItems();
            }
        } catch (error: any) {
            console.log("Error: ", error.response.data.message)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditModal(false)
    }
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0])
            setItemPhoto(e.target.files[0])
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked;
        setModalFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleMenuItemChecks = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        const { checked } = e.target;
        if (checked) return setSelectedItemIds(prev => [...prev, id])
        if (!checked && selectedItemIds.includes(id)) {
            setSelectedItemIds(prev => prev.filter(itemId => itemId !== id))
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dataToSend = new FormData()

        if (modalFormData.name.trim().length === 0) return alert("name cannot be empty")

        if (Number(modalFormData.price)! < 0 || !modalFormData.price) return alert("given Price is not valid")

        if (!modalFormData.category) return alert("Please select a category");


        try {
            dataToSend.append('name', modalFormData.name)
            dataToSend.append('price', modalFormData.price)
            dataToSend.append('category', modalFormData.category)
            dataToSend.append('availability', String(modalFormData.availability))
            dataToSend.append('isveg', String(modalFormData.isveg))

            if (itemPhoto) dataToSend.append('menuItemImage', itemPhoto)
            let response;
            if (!editModal) {
                response = await axiosClient.post('vendors/add-menu-item', dataToSend)
            } else {
                response = await axiosClient.put(`vendors/update-menu-item/${modalFormData.id}`, dataToSend)
                setEditModal(false)
            }
            if (response.status === 200 || response.status === 201)
                console.log(response.data)
            setIsModalOpen(false)
            fetchMenuItems();
            toast.success("Item successfully updated!");

        } catch (err: any) {
            console.log('vendor creation failed:', err.response.data);
            const message = err.response?.data?.message || "An unknown error occurred.";
            const status = err.response?.status;

            if (status === 409) {
                toast.error(message)
            }
            else if (status === 400) {
                toast.error(`Validation Failed: ${message}`);
            }
            else if (status === 404) {
                toast.error(message);
            }
            else {
                toast.error("Internal Server Error. Please try again later.");
            }
        }

    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* ========================
                1. HEADER SECTION
               ======================== */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
                    <p className="text-gray-500 text-sm">Manage your food items, prices and availability</p>
                </div>

                {/* Add Button */}
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
                >
                    <Plus size={20} /> Add New Item
                </button>
            </div>

            {/* ========================
                2. TOOLBAR (Search & Filter)
               ======================== */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                        placeholder="Search menu items..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-500" size={20} />
                    <select
                        defaultValue={categoryfilter}
                        onChange={handleCategoryFilterChange}
                        className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ========================
                3. ITEMS GRID
               ======================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div key={item.id} className={`group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 relative ${selectedItemIds.includes(item.id) ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200'}`}>

                            {/* Checkbox Overlay */}
                            <div className="absolute top-3 left-3 z-10">
                                <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={(e) => handleMenuItemChecks(e, item.id)}
                                    className="w-5 h-5 cursor-pointer accent-orange-600 rounded focus:ring-orange-500"
                                />
                            </div>

                            {/* Image Area */}
                            <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                {item.fullImageUrl ? (
                                    <img
                                        src={item.fullImageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon size={48} />
                                    </div>
                                )}

                                {/* Badge (Example) */}
                                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-orange-600 shadow-sm">
                                    ₹{item.price}
                                </span>
                            </div>

                            {/* Content Area */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800 truncate pr-2" title={item.name}>{item.name}</h3>
                                    {/* Action Buttons */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => handleEditClick(item, e)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => { if (item.id) handleDelete(item.id) }}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                        {/* Category Name Dikhane ke liye logic agar item object me category name hai */}
                                        {item.categoryId?.name || 'General'}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.availability ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Search size={40} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">No items found</p>
                        <p className="text-sm">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>

            {/* ========================
                4. FLOATING DELETE BAR (For Bulk Actions)
               ======================== */}
            {selectedItemIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-5">
                    <span className="font-medium flex items-center gap-2">
                        <CheckSquare size={18} className="text-orange-500" />
                        {selectedItemIds.length} Selected
                    </span>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <button
                        onClick={handleSelectDelete}
                        className="text-red-400 hover:text-red-300 font-bold flex items-center gap-2 transition-colors"
                    >
                        <Trash2 size={18} /> Delete Selected
                    </button>
                </div>
            )}

            {/* ========================
                5. MODAL (Add/Edit Form)
               ======================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={handleCloseModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editModal ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* ... (Image, Name, Price, Category Inputs - No Change) ... */}

                                {/* Image Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer border border-gray-300 rounded-lg p-1"
                                    />
                                </div>

                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="e.g. Cheese Burger"
                                        value={modalFormData.name || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Price & Category Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            id="price"
                                            placeholder="0.00"
                                            value={modalFormData.price || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            id="category"
                                            value={modalFormData.category || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select
                                            </option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* --- 🔥 NEW VEG/NON-VEG TOGGLE --- */}

                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-700">
                                        <span className={modalFormData.isveg ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                            {modalFormData.isveg ? "Pure Veg" : "Non-Veg"}
                                        </span>
                                    </span>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isveg"
                                            checked={modalFormData.isveg}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />

                                        {/* The Track (Background) */}
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 shadow-inner"></div>

                                        {/* The Moving Knob (Circle) */}
                                        <div className={`absolute top-1 left-1 bg-white h-5 w-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
                                        ${modalFormData.isveg ? "translate-x-7" : "translate-x-0"}`}
                                        >
                                            {/* Inner Dot Color Change */}
                                            <div className={`h-3 w-3 rounded-full transition-colors duration-300 ${modalFormData.isveg ? "bg-green-600" : "bg-red-600"}`}></div>
                                        </div>
                                    </label>
                                </div>

                                {/* ---Availability Toggle--- */}
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <input
                                        type="checkbox"
                                        name="availability"
                                        id="availability"
                                        checked={editModal ? modalFormData.availability : true}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                                    />
                                    <label htmlFor="availability" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                        Mark as Available
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg active:scale-95 transition-all shadow-md mt-4"
                                >
                                    {editModal ? "Save Changes" : "Add Item"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default MenuItemManagementPage