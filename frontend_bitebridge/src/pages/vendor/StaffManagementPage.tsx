import { useEffect, useState,type ChangeEvent,type FormEvent } from "react"
import axiosClient from "../../services/axiosClient"
import { type IUser } from "../../types/user.types";

interface staffFormState{
    id:string| null,
    name: string,
    email: string,
    password: string,
    phone:string
}

function StaffManagementPage() {
    const [allStaffs, setAllStaffs] = useState<IUser[] | null>(null);
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false)
    const [editModal,setEditModal] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [loading,setLoading] = useState<boolean>(true)
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [modalFormData , setModalFormData] = useState<staffFormState>({
        id:null,
        name: "",
        email: "",
        password: "",
        phone: "",
    })

    const [selectDelete, setSelectDelete] = useState<string[]>([])

    
    const fetchAllStaffs = async ()=>{
            try {
                const response = await axiosClient.get('vendors/get-all-employees')
            setAllStaffs(response.data.allEmployees)
            } catch (err: any) {
                console.log('error while getting all categories: ', err);
                setError(err.response?.data?.message) 
            }finally{
                setLoading(false)
            }
        };

    useEffect(()=>{
         fetchAllStaffs();
    },[])

    const closeModal =()=>{
        setIsModalOpen(false)
    }

    const openAddModal = ()=>{
        setIsModalOpen(true)
        setEditModal(false)
        setModalFormData({
            id:null,
            name: "",
            email: "",
            password: "",
            phone: "",
        })
    }

    const openEditModal = (staff: IUser) =>{
        setIsModalOpen(true)
        setEditModal(true)
        setModalFormData({
            id: staff._id, 
            name: staff.name, 
            email: staff.email, 
            phone: staff.phone, 
            password: ""
        })
    }

    const handleInputChange = (e:ChangeEvent<HTMLInputElement>)=>{
        const {name,value} = e.target
        setModalFormData(prev=>({
            ...prev,
            [name]:value
        }))
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

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
        if(modalFormData?.phone.length < 10){
            alert("mobile number should be in 10 digit long")
            // setError("Category name cannot be empty")
            return
        }


        try {
            const dataToSend = new FormData()
            dataToSend.append('name',modalFormData.name)
            dataToSend.append('email',modalFormData.email)
            dataToSend.append('phone',modalFormData.phone)

            if(modalFormData.password){
                dataToSend.append('password',modalFormData.password) 
            }

            if(profileImage){
                 dataToSend.append("profileImage",profileImage)
            }
           
            if(editModal){
                setEditModal(false)
            }else{
                await axiosClient.post('vendors/add-employee',dataToSend)
            }
            setIsModalOpen(false)
            fetchAllStaffs();
        } catch (error:any) {
            console.error("Form submission error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    }

    const deleteStaff = async(id:string) =>{
        try {
            const response = await axiosClient.delete(`/vendors/delete-employee/${id}`)
            alert(`deleted Category: ${response?.data?.deletedEmployee.name}`)
        } catch (error:any) {
            console.error("Delete error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }
        
    }

    const deleteSelectedStaffs = async()=>{
        console.log(selectDelete);
        try {
            const dataToSend = {
                deletedEmployee:selectDelete
            }
            const response =  await axiosClient.delete('vendors/delete-employees',{data:dataToSend})
            if(response.status == 200){
                alert(response.data.message+":"+ response.data?.deletedData)
                setSelectDelete([])
                fetchAllStaffs()
            }
        } catch (error: any) {
            console.error("DeleteMany error:", error);
            setError(error.response?.data?.message || "An error occurred.");
        }

    }

    if(loading) return <div>Loading...</div>


  return (
    <>
    <h3>Staff Management</h3>
    <button onClick={openAddModal}>New Staff</button>
    {isModalOpen && (
        <div className="modal">
            <h2>{editModal?"Edit": "Add"} Modal</h2>
            <form action="" method="post" onSubmit={handleSubmit} >
                <input type="text" name="name"placeholder="name" id="staff-modal-name" value={modalFormData?.name} onChange={handleInputChange} autoFocus />
                <input type="email" name="email" placeholder="email" id="staff-modal-email" value={modalFormData?.email} onChange={handleInputChange}  />
                <input type="number" name="phone" placeholder="phone" id="staff-modal-phone" value={modalFormData?.phone} onChange={handleInputChange}  />
                <input type="password"  placeholder={editModal?"leave it blank in update case":""} name="password" id="staff-modal-password" value={modalFormData?.password} onChange={handleInputChange}  />
                <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleFileChange}  />

                <button type="submit">{editModal?"Edit": "Add"}</button>
                <button type="button" onClick={closeModal}>close</button>
            </form>
        </div>
    ) 
    }

    <div className="category-container">
        
            {allStaffs?.map((staff:IUser)=>(
                <div className="category" key={staff?._id}>
                    <input type="checkbox" value={staff?._id} onChange={handleCheckboxChange} name="category" id={`category-${staff._id}`} />
                            <span>{staff?.name}</span>
                            <button onClick={()=>{openEditModal(staff)}}>edit</button>
                            <button onClick={()=>{deleteStaff(staff?._id)}}>delete</button>
                </div> 
            ))}
        
    </div>
    {error && <div style={{color:"red"}}>Error: {error}</div>}
    {selectDelete.length!==0 && <button onClick={deleteSelectedStaffs}>Delete Selected</button>}
    </>
  )
}

export default StaffManagementPage