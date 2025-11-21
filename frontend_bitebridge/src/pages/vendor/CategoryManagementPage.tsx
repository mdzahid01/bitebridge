import { useEffect, useState,type ChangeEvent,type FormEvent } from "react"
import axiosClient from "../../services/axiosClient"
import {type iCategory} from '../../types/category' 

function CategoryManagementPage() {
    const [allCategories, setAllCategories] = useState<iCategory[] | null>(null);
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false)
    const [editModal,setEditModal] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [loading,setLoading] = useState<boolean>(true)
    const [modalFormData , setModalFormData] = useState<{id:string|null, name: string}>({
        id: null,
        name:""
    })

    const [selectDelete, setSelectDelete] = useState<string[]>([])

    
    const fetchAllCategories = async ()=>{
            try {
                const response = await axiosClient.get('vendors/get-all-categories')
            setAllCategories(response.data.categories)
            } catch (err: any) {
                console.log('error while getting all categories: ', err);
                setError(err.response?.data?.message) 
            }finally{
                setLoading(false)
            }
        };

    useEffect(()=>{
         fetchAllCategories();
    },[allCategories])

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
        console.log(editModal)
        if(modalFormData?.name.trim() === ""){
            alert("Category name cannot be empty")
            // setError("Category name cannot be empty")
            return
        }

        try {
            if(editModal){
                await axiosClient.put(`/vendors/update-category/${modalFormData?.id}`,{ name: modalFormData?.name })
                setIsModalOpen(false)
                setEditModal(false)
            }else{
                await axiosClient.post('vendors/add-category',{ name: modalFormData?.name })
                setIsModalOpen(false)
            }
        } catch (error:any) {
            console.error("Form submission error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    }

    const deleteCategory = async(id:string) =>{
        try {
            const response = await axiosClient.delete(`/vendors/delete-category/${id}`)
            alert(`deleted Category: ${response?.data?.deletedCategory.name}`)
        } catch (error:any) {
            console.error("Delete error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
        
    }

    const deleteSelectedCategory = async()=>{
        console.log(selectDelete);
        try {
            const dataToSend = {
                deletingCategory:selectDelete
            }
            const response =  await axiosClient.delete('vendors/delete-categories',{data:dataToSend})
            if(response.status == 200){
                alert(response.data.message)
                setSelectDelete([])
                fetchAllCategories()
            }
        } catch (error: any) {
            console.error("DeleteMany error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }

    }

    if(loading) return <div>Loading...</div>

    if(error) return <div style={{color:"red"}}>Error: {error}</div>

  return (
    <>
    <h3>Category Management</h3>
    <button onClick={openAddModal}>New Category</button>
    {isModalOpen && (
        <div className="modal">
            <h2>{editModal?"Edit": "Add"} Modal</h2>
            <form action="" method="post" onSubmit={handleSubmit} >
                <input type="text" name="name" id="cat-modal-name" value={modalFormData?.name} onChange={handleModalNameChange} autoFocus />
                <button type="submit">{editModal?"Edit": "Add"}</button>
                <button type="button" onClick={closeModal}>close</button>
            </form>
        </div>
    ) 
    }

    <div className="category-container">
        
            {allCategories?.map((category:iCategory)=>(
                <div className="category" key={category?._id}>
                    <input type="checkbox" value={category?._id} onChange={handleCheckboxChange} name="category" id={`category-${category._id}`} />
                            <span>{category?.name}</span>
                            <button onClick={()=>{openEditModal(category)}}>edit</button>
                            <button onClick={()=>{deleteCategory(category?._id)}}>delete</button>
                </div> 
            ))}
        
    </div>
    {selectDelete.length!==0 && <button onClick={deleteSelectedCategory}>Delete Selected</button>}
    </>
  )
}

export default CategoryManagementPage