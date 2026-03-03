import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import axiosClient from "../../services/axiosClient"
import { type IUser } from "../../types/user.types";
import { 
    Plus, 
    Search, 
    Mail, 
    Phone, 
    Edit2, 
    Trash2, 
    X, 
    User, 
    Upload, 
    Shield, 
    CheckSquare,
    Loader2,
    Users
} from "lucide-react";
import toast from "react-hot-toast";
import usePageTitle from "../../hooks/usePageTitle";

interface staffFormState {
    id: string | null,
    name: string,
    email: string,
    password: string,
    phone: string
}

function StaffManagementPage() {
    usePageTitle("Staff Management")
    // --- STATES ---
    const [allStaffs, setAllStaffs] = useState<IUser[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editModal, setEditModal] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [modalFormData, setModalFormData] = useState<staffFormState>({
        id: null,
        name: "",
        email: "",
        password: "",
        phone: "",
    })

    const [selectDelete, setSelectDelete] = useState<string[]>([])
    const [searchTerm,setSearchTerm] = useState<string>('')
  
    const fetchAllStaffs = async () => {
        try {
            const response = await axiosClient.get('vendors/get-all-employees')
            setAllStaffs(response.data.allEmployees)
        } catch (err: any) {
            console.log('error while getting all categories: ', err);
            setError(err.response?.data?.message)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchAllStaffs();
    }, [])

    // --- HANDLERS ---
    const closeModal = () => {
        setIsModalOpen(false)
        setError(null)
    }

    const openAddModal = () => {
        setIsModalOpen(true)
        setEditModal(false)
        setProfileImage(null) // Reset image on new add
        setModalFormData({
            id: null,
            name: "",
            email: "",
            password: "",
            phone: "",
        })
    }

    const openEditModal = (staff: IUser) => {
        setIsModalOpen(true)
        setEditModal(true)
        setProfileImage(null)
        setModalFormData({
            id: staff._id,
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            password: ""
        })
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setModalFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const id = e.target.value
        const isChecked = e.target.checked

        if (isChecked) {
            setSelectDelete((prev) => [...prev, id])
        }
        else {
            setSelectDelete((prevSelected) => prevSelected.filter((prevId) => prevId !== id))
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        
        if (modalFormData?.name.trim() === "") {
            alert("Name cannot be empty")
            return
        }
        if (modalFormData?.phone.length < 10) {
            alert("Mobile number should be 10 digits long")
            return
        }

        try {
            const dataToSend = new FormData()
            dataToSend.append('name', modalFormData.name)
            dataToSend.append('email', modalFormData.email)
            dataToSend.append('phone', modalFormData.phone)

            if (modalFormData.password) {
                dataToSend.append('password', modalFormData.password)
            }

            if (profileImage) {
                dataToSend.append("profileImage", profileImage)
            }

            if (editModal) {
                await axiosClient.put(`/vendors/update-employee/${modalFormData?.id}`,dataToSend)
                setEditModal(false)
                toast.success("Employee Updated")
            } else {
                await axiosClient.post('vendors/add-employee', dataToSend)
            }
            setIsModalOpen(false)
            fetchAllStaffs();
        } catch (error: any) {
            console.error("Form submission error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    }

    const deleteStaff = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) return;
        try {
            const response = await axiosClient.delete(`/vendors/delete-employee/${id}`)
            toast.success(`Deleted: ${response?.data?.deletedEmployee.name}`)
            fetchAllStaffs() // Refresh list
        } catch (error: any) {
            console.error("Delete error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    }

    const deleteSelectedStaffs = async () => {
        if (!window.confirm(`Delete ${selectDelete.length} staff members?`)) return;
        try {
            const dataToSend = {
                deletedEmployee: selectDelete
            }
            const response = await axiosClient.delete('vendors/delete-employees', { data: dataToSend })
            if (response.status == 200) {
                // alert(response.data.message)
                setSelectDelete([])
                fetchAllStaffs()
            }
        } catch (error: any) {
            console.error("DeleteMany error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    }

    const filteredEmployees = allStaffs?.filter(staff=>
        staff.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase().trim()) ||
        staff.email.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase().trim()) ||
        staff.phone.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase().trim())
    )
    // --- RENDER UI ---

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-gray-500 font-medium">Loading staff...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center text-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-orange-600" />
                        Staff Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your team staffs</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e)=>setSearchTerm(e.target.value)}
                            placeholder="Search staff..." 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    <button 
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-2 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} />Add Staff
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={18}/></button>
                </div>
            )}

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                {filteredEmployees?.map((staff: any) => (
                    <div 
                        key={staff._id} 
                        className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden hover:shadow-lg ${
                            selectDelete.includes(staff._id) 
                                ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/30' 
                                : 'border-gray-200 shadow-sm'
                        }`}
                    >
                        {/* Checkbox (Absolute Position) */}
                        <div className="absolute top-4 left-4 z-10">
                            <input 
                                type="checkbox" 
                                value={staff._id} 
                                onChange={handleCheckboxChange} 
                                checked={selectDelete.includes(staff._id)}
                                className="w-5 h-5 cursor-pointer accent-orange-600 rounded focus:ring-orange-500"
                            />
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex flex-col items-center text-center">
                            
                            {/* Avatar */}
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full p-1 border-2 border-orange-100 bg-white shadow-inner">
                                    <img 
                                        src={staff.fullImageUrl || "https://via.placeholder.com/150"} 
                                        alt={staff.name} 
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + staff.name + "&background=random";
                                        }}
                                    />
                                </div>
                                {/* Active Indicator (Visual Only) */}
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Active"></div>
                            </div>

                            {/* Info */}
                            <h3 className="text-lg font-bold text-gray-800">{staff.name}</h3>
                            <span className="inline-block bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium mt-1 mb-4 uppercase tracking-wide">
                                {staff.role === 'vendorStaff' ? 'Staff Member' : staff.role}
                            </span>

                            {/* Contact Details */}
                            <div className="w-full space-y-2 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-3 text-gray-600 text-sm justify-center">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="truncate max-w-[200px]">{staff.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 text-sm justify-center">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{staff.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-xs text-gray-400 font-medium">
                                {/* Permissions count logic purely visual */}
                                <span className="flex items-center gap-1">
                                    <Shield size={14} /> 
                                    {staff.permissions?.length || 0} Permissions
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openEditModal(staff)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => deleteStaff(staff._id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredEmployees?.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No staff members found</p>
                        <button onClick={openAddModal} className="mt-4 text-orange-600 hover:underline">
                            Add your first employee
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Bulk Delete Bar */}
            {selectDelete.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-5 border border-gray-700">
                    <span className="font-medium flex items-center gap-2">
                        <CheckSquare size={18} className="text-orange-500" />
                        {selectDelete.length} Selected
                    </span>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <button 
                        onClick={deleteSelectedStaffs}
                        className="text-red-400 hover:text-red-300 font-bold flex items-center gap-2 transition-colors"
                    >
                        <Trash2 size={18} /> Delete Selected
                    </button>
                </div>
            )}

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={closeModal}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editModal ? "Edit Staff Details" : "Add New Staff"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                
                                {/* Image Upload */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group-hover:border-orange-500 transition-colors">
                                            {profileImage ? (
                                                <img 
                                                    src={URL.createObjectURL(profileImage)} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <User className="text-gray-400 w-10 h-10" />
                                            )}
                                        </div>
                                        <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-orange-700 transition-transform hover:scale-105">
                                            <Upload size={14} />
                                        </label>
                                        <input 
                                            type="file" 
                                            id="profileImage" 
                                            name="profileImage" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                name="name" 
                                                placeholder="John Doe" 
                                                value={modalFormData?.name} 
                                                onChange={handleInputChange} 
                                                autoFocus 
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    placeholder="john@example.com" 
                                                    value={modalFormData?.email} 
                                                    onChange={handleInputChange} 
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input 
                                                    type="number" 
                                                    name="phone" 
                                                    placeholder="9876543210" 
                                                    value={modalFormData?.phone} 
                                                    onChange={handleInputChange} 
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password {editModal && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                                        </label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            placeholder="••••••••" 
                                            value={modalFormData?.password} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium shadow-md active:scale-95 transition-all"
                                    >
                                        {editModal ? "Save Changes" : "Create Staff"}
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

export default StaffManagementPage