import { useState, type ChangeEvent, type FormEvent, type MouseEvent, type KeyboardEvent } from 'react'
import axiosClient from '../../services/axiosClient' // Apna path check kar lena
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, X, ArrowRight, Layers, Loader2, AlertCircle } from 'lucide-react'

function CreateCategory() {
    const [currentcategory, setCurrentCategory] = useState<string>("")
    const [categories, setCategories] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const navigate = useNavigate()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentCategory(e.target.value)
        if (error) setError(null) // User type kare to error hata do
    }

    const handleAdd = (e: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>) => {
        // e.preventDefault() form submit hone se rokne ke liye
        if (e.type === 'click') {
            e.preventDefault();
        }

        setError(null)
        const trimmedCategory = currentcategory.trim()

        if (trimmedCategory === "") {
            toast.error("Can't add empty category")
            return;
        }

        // Case insensitive check (Optional: agar 'Pizza' aur 'pizza' same maanna hai)
        if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
            toast.error("Category already exists!")
            return;
        }

        setCategories([...categories, trimmedCategory])
        setCurrentCategory("")
    }

    const handleRemove = (categoryToDelete: string) => {
        setCategories(categories.filter(category => category !== categoryToDelete))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (categories.length === 0) {
            setError("Please add at least one category before saving.");
            return;
        }

        setLoading(true)
        setError(null)

        try {
            // NOTE: Check your API structure here. Usually sending an object { categories: [...] } is safer than raw array
            const response = await axiosClient.post('/vendors/create-categories',  {categoryNames: categories} ); 
            
            toast.success("Categories saved successfully!")
            console.log(response.data?.createdCategories);
            navigate('/') // Ya fir next step par bhejein

        } catch (err: any) {
            console.log("Error Found: ", err);
            const errorMsg = err.response?.data?.message || "Failed to create categories";
            toast.error(errorMsg)
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="bg-orange-600 px-8 py-6 text-center">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Layers className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Setup Your Menu</h2>
                    <p className="text-orange-100 text-sm mt-1">Add categories like 'Starters', 'Main Course'</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Input Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add New Category
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name='category'
                                    value={currentcategory}
                                    onChange={handleChange}
                                    placeholder="e.g. Desserts"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAdd(e);
                                        }
                                    }}
                                />
                                <button
                                    type='button'
                                    onClick={handleAdd}
                                    className="bg-gray-900 hover:bg-black text-white px-5 rounded-xl transition-colors flex items-center justify-center active:scale-95"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Error Message Display */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Added Categories List (Chips) */}
                        <div className="min-h-[100px] bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                            {categories.length > 0 ? (
                                <div className='flex flex-wrap gap-2'>
                                    {categories.map((category, index) => (
                                        <div 
                                            key={index} 
                                            className="group flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full shadow-sm hover:border-orange-300 transition-all animate-in zoom-in-50 duration-200"
                                        >
                                            <span className="font-medium text-sm">{category}</span>
                                            <button
                                                type='button'
                                                onClick={() => handleRemove(category)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm mt-4">
                                    <Layers size={24} className="mb-2 opacity-20" />
                                    <span>No categories added yet.</span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || categories.length === 0}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                                    loading || categories.length === 0
                                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                                        : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Next Step
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateCategory