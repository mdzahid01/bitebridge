import {useState, type ChangeEvent,type FormEvent,type MouseEvent, type KeyboardEvent} from 'react'
import axiosClient from '../../services/axiosClient'
import { useNavigate } from 'react-router-dom'

function CreateCategory() {
    const [currentcategory , setCurrentCategory] = useState<string>("")
    const [categories,setCategories] = useState<string[]>([])
    const [error, setError] = useState<string| null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const navigate = useNavigate()

    const handleChange = (e:ChangeEvent<HTMLInputElement>)=>{
        setCurrentCategory(e.target.value)   
    }

    const handleAdd = (e:MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>)=>{
        e.preventDefault();

        setError(null)
        if(currentcategory.trim()==="") {
            alert("can't add empty category")
            return;
        }
        
        if(categories.includes(currentcategory.trim())){
            alert("can't add duplicate category")
            setCurrentCategory("");
            return;
        } 

        setCategories([...categories,currentcategory.trim()])
        setCurrentCategory("")
    }

    const handleRemove = (categaryToDelete:string)=>{
        setCategories(categories.filter(categary => categary!==categaryToDelete))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true)
        setError(null)

        try {
            const response = await axiosClient.post('/vendors/create-categories',categories);
            alert("success");
            console.log(response.data?.createdCategories);
            navigate('/')
            
        } catch (err: any) {
            console.log("Error Found: ",err);
            setLoading(false)
            setError(err.response.data.message || "failed to create Categories")
        }finally{
            setLoading(false)
        }

        
        console.log("Submitting categories:", categories);
        console.log("haan meri jaan");
        
    }
  return (
    <>
    <h2>Add Atlest One Category</h2>
    <form action="" onSubmit={handleSubmit}>
    <input 
    type="text"
    name='category'
    value={currentcategory} 
    onChange={handleChange}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            e.preventDefault(); 
            handleAdd(e);
        }
    }} 
  />
    <button type='button'
     onClick={handleAdd}
     >Add</button>
    {categories.length>0 &&(<>
    <h3>Your Added Categories:</h3>
    <div className="chipContainer">
        {
            categories.map((category, index)=>(
                <div className="chip" key={index}>
                    {category}
                <button type='button' className='chip-remove' onClick={()=>{handleRemove(category)}}>X</button>
                </div>
            ))
        }
    </div>

    <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Saving..." : "Next"}
        </button>
    
    </>)}

    {error && <p style={{'color': 'red'}}>{error}</p> }
    </form>
    </>
  )
}

export default CreateCategory
