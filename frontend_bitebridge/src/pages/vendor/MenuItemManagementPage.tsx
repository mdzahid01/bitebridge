import { useEffect, useState,type MouseEvent,type KeyboardEvent, type ChangeEvent, type FormEvent } from 'react'
import axiosClient from '../../services/axiosClient'
import type { iCategory } from '../../types/category'



type imageStyleType = {
    width: string,
    height: string,
    objectFit: "cover" | "contain" | "fill" 
}

const imageSize: imageStyleType = {
    width: "100px",
    height: "100px",
    objectFit: "fill"
}

type CategoryApiResponse = {
    message: string,
    categories?: iCategory[],
    error?: string
}

type IMenuItemDisplay={
    id: string,
    name: string,
    price: string,
    categoryId: iCategory
    availability: boolean
    fullImageUrl: string | null,
}
type IMenuItemForm={
    id: string| null,
    name: string,
    price: string,
    category: string,
    fullImageUrl: string | null,
    availability: boolean
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


    const [isModalOpen,setIsModalOpen] = useState<boolean>(false)
    const [editModal,setEditModal] = useState<boolean>(false)

    const [itemPhoto,setItemPhoto] = useState<File | null>(null)

    const [modalFormData, setModalFormData] = useState<IMenuItemForm>({
        id:null,
        name: '',
        price:'',
        availability:false,
        category:'',
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


    const fetchMenuItems = async function() {
        try{
            const {data} = await axiosClient.get<MenuApiResponse>('/vendors/get-all-menu-items')
            setMenuItems(data.allMenuItems || [])
            console.log(data);
        }
        catch(error){
            console.error("Error fetching categories", error)
        }
    };

    useEffect(()=>{
        fetchMenuItems();
    },[])

    useEffect(() => {
        let result = menuItems
        // for Category wise filtering menuItems
        if(categoryfilter.toLowerCase() !== 'all'){
            result = result.filter(item => item.categoryId?.name.toLowerCase() === categoryfilter.toLowerCase())
            
        }
        // for name wise filtering menuItems
        if(debouncedSearch.trim()!==""){
            result = result.filter(item=> item.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
        }

        setFilterdItems(result)
    }, [menuItems,categoryfilter,debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        },350
    );
    return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCategoryFilterChange = (e: ChangeEvent<HTMLSelectElement>)=>{
        setCategoryFilter(e.target.value)
        console.log(categoryfilter)
    }
    
    const handleSearchQueryChange =(e:ChangeEvent<HTMLInputElement>)=>{
        setSearchQuery(e.target.value)
        
    }
    const handleAddClick = (e:MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>)=>{
        e.preventDefault();
        setEditModal(false)
        setIsModalOpen(true)
        setModalFormData({
            id:null,
            name: '',
            price:'',
            availability:false,
            category:'',
            fullImageUrl: null,
        });
    }
    const handleEditClick = (item: IMenuItemDisplay,e: MouseEvent<HTMLButtonElement>)=>{
        console.log("Edit Item Data:", item);
        e.preventDefault();
        e.stopPropagation()
        setEditModal(true)
            setModalFormData({
                id:item.id,
                name: item.name,
                price:item.price,
                availability:item.availability,
                category: item.categoryId ? item.categoryId._id : "", //agar backend se hi category null aayi to us case me Optional Chaining safe rakhega frontend ko crash hone se
                fullImageUrl: item.fullImageUrl,
            })
        setIsModalOpen(true)
    }

     const handleDelete = async(id:string)=>{
        if (!window.confirm("Are you sure you want to delete this menu item?")) {
            return;
        }
        try {
            const response = await axiosClient.delete(`vendors/delete-menu-item/${id}`)
            if(response.status === 200){
                setMenuItems((prev)=>(prev.filter(item=>item.id!==id)))
            }
        } catch (err: any) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Failed to delete item");   
        }
    }

    const handleCloseModal=()=>{
        setIsModalOpen(false)
        setEditModal(false)
    }
    const handleFileChange = (e:ChangeEvent<HTMLInputElement>)=>{
        if(e.target.files && e.target.files[0])
            setItemPhoto(e.target.files[0])
    }

    const handleInputChange = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        const {name,value,type} = e.target
        const checked =(e.target as HTMLInputElement).checked;
        setModalFormData((prev)=>({
            ...prev,
            [name]: type=== "checkbox"?checked:value
        }))
    }

    const handleMenuItemChecks = (e:ChangeEvent<HTMLInputElement>,id:string)=>{
        const {checked} = e.target;
        if(checked ) return setSelectedItemIds(prev => [...prev,id])
        if (!checked && selectedItemIds.includes(id)) {
            setSelectedItemIds(prev=>prev.filter(itemId=> itemId !==id))
        }
    }

    const handleSubmit = async (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const dataToSend = new FormData()

        if(modalFormData.name.trim().length===0)  return alert("name cannot be empty")
            
        if(Number(modalFormData.price)!<0 || !modalFormData.price)  return alert("given Price is not valid")

        if (!modalFormData.category) return alert("Please select a category");
    
        
        try {
            dataToSend.append('name',modalFormData.name)
            dataToSend.append('price', modalFormData.price)
            dataToSend.append('category', modalFormData.category)
            if(editModal){
                dataToSend.append('availability',String(modalFormData.availability))
            }
            if(itemPhoto)  dataToSend.append('menuItemImage',itemPhoto)
            let response;
            if(!editModal){
                response = await axiosClient.post('vendors/add-menu-item',dataToSend)
                alert("success: " + response.data)
            }else{
                response = await axiosClient.put(`vendors/update-menu-item/${modalFormData.id}`,dataToSend)
                alert("success: " + response.data)
            }
            if(response.status===200 || response.status===201)
            console.log(response.data)
            fetchMenuItems();
            
        } catch (err: any) {
            console.log('vendor creation failed:', err.response.data);
        }

    }

    return (
        <>
            <h3>MenuItemManagementPage</h3>
            {isModalOpen && (
                <div className="modal">
                <form onSubmit={handleSubmit}>
                    <input 
                    type="file" 
                    name="" 
                    id=""
                    accept="image/*"
                    onChange={handleFileChange}
                    />

                    <input 
                        type="text" 
                        name="name" 
                        placeholder='name' 
                        id="name" 
                        value={modalFormData.name || ''}
                        onChange={handleInputChange}
                    />
                    <input 
                        type="number" 
                        name="price" 
                        placeholder='price' 
                        id="price" 
                        value={modalFormData.price || ''} 
                        onChange={handleInputChange} 
                    />
                    {editModal && 
                        <label htmlFor="availability">
                            Available:
                            <input
                            type="checkbox"
                            name="availability"
                            checked={modalFormData.availability}
                            onChange={handleInputChange}
                        />
                        </label>
                    }
     
                    <select name="category" id="category" value={modalFormData.category || ''} onChange={handleInputChange}>
                        <option value="" disabled >select category</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                    <button type="submit">{editModal?'Edit':'Add'}</button>
                </form>
                <button onClick={handleCloseModal}>close</button>
            </div>
            )}

            <div className="row">
                <select name="category" id="category" defaultValue={categoryfilter} onChange={handleCategoryFilterChange}>
                    <option value="All" >All</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <input type="text" name="searchQuery" id="searchQuery" value={searchQuery} onChange={handleSearchQueryChange} placeholder='Search Here...'/>
                <button onClick={handleAddClick}>+</button>
            </div>

            <div className="item-container">
                {/* filteredItems */}
                {/* menuItems */}
                     {filteredItems.length>0? (filteredItems.map((item) => (
                       <div className="item" key={item.id}>
                        <input type="checkbox" name="menu-Item-checkbox" checked={selectedItemIds.includes(item.id)} id={item.id} onChange={(e)=>handleMenuItemChecks(e,item.id)}/>
                        <img  style={imageSize}src={item.fullImageUrl|| "https://placehold.co/100"} alt={item.name} />
                        <span>{item.name}</span>
                        <span>{item.price}</span>
                        <button type='button' onClick={(e)=>{handleEditClick(item,e)}}>Edit</button>
                        <button onClick={()=>{if(item.id){handleDelete(item.id)}}}>Delete</button>
                       </div>
                    ))):<div>No Item Found</div>}
            </div>
        </>
    )
}

export default MenuItemManagementPage