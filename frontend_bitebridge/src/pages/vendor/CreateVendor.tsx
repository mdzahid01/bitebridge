// import React from 'react'
import { useState, type ChangeEvent, type FormEvent } from "react"
import axiosClient from "../../services/axiosClient";
import { useNavigate } from "react-router-dom";

function CreateVendor() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
    })

    const [shopPhoto, setShopPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setShopPhoto(e.target.files[0])
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        setError(null);
        if (!formData.shopName || formData.shopName.length < 1) {
            setError("Shop Name is required")
            setLoading(false)
            return
        }
        
        if (!formData.address || formData.address.length < 1) {
            setError("Address is required")
            setLoading(false)
            return
        }
        
        if (!shopPhoto) {
            setError("shop photo is required")
            setLoading(false)
            return
        }
        try {
            const dataToSubmit = new FormData()
            dataToSubmit.append('shopName', formData.shopName)
            dataToSubmit.append('address', formData.address)
            dataToSubmit.append('shopImage', shopPhoto)

            const response = await axiosClient.post('/vendors/create-vendor', dataToSubmit)
            alert("success: " + response.data)
            console.log(response.data)
            setError(response.data.message)
            navigate('/add-category')

        } catch (err: any) {
            console.log('vendor creation failed:', err.response.data);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                console.log(err.response)
            } else if (err.message) {
                console.log(err.response)
                setError(err.message);
            } else {
                setError('An error occurred during signup.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h3>Create Vendor</h3>
            <form onSubmit={handleSubmit} method="post">
                <input
                    type="text"
                    name="shopName"
                    id="shopName"
                    onChange={handleChange}
                    value={formData.shopName}
                />
                <input
                    type="text"
                    name="address"
                    id="address"
                    onChange={handleChange}
                    value={formData.address}
                />
                <input type="file"
                    name="shopPhoto"
                    id="shopPhoto"
                    accept="image/*"
                    onChange={handleFileChange} />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">{!loading? 'Create':'Loading...'}</button>
            </form>
        </>
    )
}

export default CreateVendor