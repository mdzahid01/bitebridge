import { useEffect, useState,type ChangeEvent,type FormEvent } from "react"
import axiosClient from "../../services/axiosClient"
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import {type iCategory} from '../../types/category'
import { 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Layers, 
    AlertCircle, 
    CheckSquare,
    Search,
    CircleX,
} from 'lucide-react';
import toast from "react-hot-toast";
import { Link } from "react-router-dom";


function CategoryManagementPage() {
    // const [allCategories, setAllCategories] = useState<iCategory[] | null>(null);
    const [allCategories, setAllCategories] = useState<iCategory[]>([]);
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false)
    const [editModal,setEditModal] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [loading,setLoading] = useState<boolean>(true)
    const [searchTerm,setSearchTerm] = useState<string>("");
    const [modalFormData , setModalFormData] = useState<{id:string|null, name: string}>({
        id: null,
        name:""
    })

    const [selectDelete, setSelectDelete] = useState<string[]>([])

    
    const fetchAllCategories = async ()=>{
            try {
                const response = await axiosClient.get('vendors/get-all-categories')
            setAllCategories(response.data.categories.sort((a:iCategory,b:iCategory)=>a.name.localeCompare(b.name)))
            } catch (err: any) {
                console.log('error while getting all categories: ', err);
                setError(err.response?.data?.message) 
            }finally{
                setLoading(false)
            }
        };

    useEffect(()=>{
         fetchAllCategories();
    },[])

    const closeModal =()=>{
        setIsModalOpen(false)
    }

    const openAddModal = ()=>{
        setIsModalOpen(true)
        setEditModal(false)
        setModalFormData({id:null,name:""})
    }

    const openEditModal = (cat: iCategory) =>{
        setIsModalOpen(true)
        setEditModal(true)
        setModalFormData({id:cat._id,name:cat.name})
    }

    const handleModalNameChange = (e:ChangeEvent<HTMLInputElement>)=>{
        const {value} = e.target
        setModalFormData(prev=>({
            ...prev,
            name:value
        }))
    }

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>)=>{
        const id = e.target.value
        const isChecked = e.target.checked

        if(isChecked){
            setSelectDelete((prev)=>[...prev,id])
        }
        else{
            setSelectDelete((prevSelected)=>prevSelected.filter((prevId)=>prevId !== id))
        }
    }

    
    const handleSubmit =async (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        setError(null)
        if(modalFormData?.name.trim() === ""){
            toast.error("Category name cannot be empty")
            // setError("Category name cannot be empty")
            return
        }

        try {
            if(editModal){
                await axiosClient.put(`/vendors/update-category/${modalFormData?.id}`,{ name: modalFormData?.name })
                setEditModal(false)
            }else{
                await axiosClient.post('vendors/add-category',{ name: modalFormData?.name })
                
            }
        } catch (error:any) {
            console.error("Form submission error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }finally{
            setIsModalOpen(false)
            fetchAllCategories();
        }
    }

    const deleteCategory = async(id:string) =>{
        const categoryToRestore = allCategories.find(cat => cat._id === id);
        try {
            setAllCategories(prev=>prev.filter(cat=> cat._id!= id))
            // setAllCategories(prev => prev.filter(cat => cat._id !== id))
            const response = await axiosClient.delete(`/vendors/delete-category/${id}`)
            alert(`deleted Category: ${response?.data?.deletedCategory.name}`)
        } catch (error:any) {
            console.error("Delete error:", error);
            setError(error.response?.data?.message || "Category deletion failed. Try Again...");
            if(categoryToRestore){
                setAllCategories(prev => [...prev, categoryToRestore]);
            }
        }
        
    }

    const deleteSelectedCategory = async()=>{
        console.log(selectDelete);
        const categoryToRestore = allCategories.filter(cat=>selectDelete.includes(cat._id))
        try {
            setAllCategories(prev=> prev.filter(cat=>!selectDelete.includes(cat._id)))
            const dataToSend = {
                deletingCategory:selectDelete
            }
            const response =  await axiosClient.delete('vendors/delete-categories',{data:dataToSend})
            if(response.status == 200){
                alert(response.data.message)
                setSelectDelete([])
                // fetchAllCategories()
            }
        } catch (error: any) {
            console.error("DeleteMany error:", error);
            setError(error.response?.data?.message || "Category deletion failed. Try Again...");
            setAllCategories(prev=>[...prev, ...categoryToRestore].sort((a, b) => a.name.localeCompare(b.name)))
        }

    }
    const filteredCategories = allCategories?.filter((cat)=>cat.name.toLowerCase().includes(searchTerm.toLowerCase()))

    if(loading) return <LoadingSpinner/>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* ========================
          1. HEADER SECTION
         ======================== */}
      {/* Header Section */}
<div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
    
    {/* Left Side: Title */}
    <div>
        <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Layers size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        </div>
        <p className="text-gray-500 text-sm mt-1 ml-12">Organize your menu items</p>
    </div>

    {/* Right Side: Search & Add Button */}
    <div className="flex gap-3 w-full md:w-auto">
        
        {/* SEARCH BAR UI */}
        <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
        </div>

        <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
            <Plus size={20} /> <span className="hidden sm:inline">New</span>
        </button>
    </div>
</div>

      {/* ========================
          2. ERROR MESSAGE
         ======================== */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex  flex-row items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-row gap-2">
                <AlertCircle size={20} />
            { error=="No Vendor Found: Create Vendor first"?<span>{error} <Link to="/create-vendor" className="text-gray-400 underline underline-offset-1">Create Vendor</Link></span>:<span>{error}</span> }
            </div>
            <CircleX size={20} onClick={()=>setError(null)} className="cursor-pointer"/>
        </div>
      )}

      {/* ========================
          3. CATEGORY GRID
         ======================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
        {filteredCategories && filteredCategories.length > 0 ? (
            filteredCategories.map((category: iCategory) => (
                <div 
                    key={category?._id} 
                    className={`group bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between ${
                        // Agar select kiya hai to orange border dikhao
                        // (Maan raha hu selectDelete me IDs store ho rahi hain)
                        selectDelete.includes(category._id) ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Checkbox */}
                        <input 
                            type="checkbox" 
                            value={category?._id} 
                            onChange={handleCheckboxChange} 
                            id={`category-${category._id}`} 
                            checked={selectDelete.includes(category._id)}
                            className="w-5 h-5 cursor-pointer accent-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
                        />
                        {/* Name */}
                        <label 
                            htmlFor={`category-${category._id}`} 
                            className="font-semibold text-gray-700 truncate cursor-pointer select-none"
                            title={category?.name}
                        >
                            {category?.name}
                        </label>
                    </div>

                    {/* Action Buttons (Hover pe dark/visible honge) */}
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => openEditModal(category)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => deleteCategory(category?._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div> 
            ))
        ) : (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                <Layers size={48} className="mx-auto mb-3 opacity-20" />
                <p>No categories found. Create one to get started!</p>
            </div>
        )}
      </div>

      {/* ========================
          4. FLOATING BULK DELETE
         ======================== */}
      {selectDelete.length !== 0 && (
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-5">
            <span className="font-medium flex items-center gap-2">
                <CheckSquare size={18} className="text-orange-500" />
                {selectDelete.length} Selected
            </span>
            <div className="h-6 w-px bg-gray-700"></div>
            <button 
                onClick={deleteSelectedCategory}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-2 transition-colors"
            >
                <Trash2 size={18} /> Delete Selected
            </button>
        </div>
      )}

      {/* ========================
          5. MODAL (Add/Edit)
         ======================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-transform"
            onClick={(e)=>{e.stopPropagation()}}>
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editModal ? "Edit Category" : "New Category"}
                    </h2>
                    <button 
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="cat-modal-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                id="cat-modal-name" 
                                value={modalFormData?.name || ''} 
                                onChange={handleModalNameChange} 
                                autoFocus 
                                placeholder="e.g. Starters, Drinks"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button 
                                type="button" 
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors shadow-sm active:scale-95"
                            >
                                {editModal ? "Save Changes" : "Create Category"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}
export default CategoryManagementPage