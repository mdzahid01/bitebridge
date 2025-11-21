export type userRole = 'vendorOwner' | 'vendorStaff' | 'customer' | 'superAdmin' ;

export interface IUser{
    _id: string,
    name: string,
    email: string,
    phone: string,
    role: userRole,
    permissions?: string[];
    imageUrl?: string; 
    fullImageUrl?: string; 
    vendorId?: string;
    createdAt: string;
    updatedAt: string;

}