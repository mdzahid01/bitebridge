import mongoose,{Document,model,Query,Schema} from "mongoose";
import bcrypt from "bcrypt"

export interface iUser extends Document{
    name : string,
    email: string,
    password?:string,
    phone: string,
    role: "vendorOwner" | "vendorStaff" | "customer" | "superAdmin",
    vendorId?: mongoose.Schema.Types.ObjectId,
    permissions?:string[],
    isDeleted?: boolean,
    deletedAt?: Date,
    superAdmin: boolean,
    imageUrl?: string,
    comparePassword(password: string): Promise<boolean>;
    softDelete(): Promise<void>;
}

const userSchema = new Schema<iUser>({
    name: {
        type: String,
        required:[true,"Name is required"],
        trim: true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim: true,
        unique:true,
        lowercase:true,
    },
    phone: {
        type: String,
        required: [true, "Number is required"],
        unique: true,
        minlength: [10, "Phone number must be 10 digits long"],
        maxlength: [10, "Phone number must be 10 digits long"],
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        select:false,
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role:{
        type:String,
        enum: ["vendorOwner" , "vendorStaff" , "customer" , "superAdmin"],
        default:"customer",
    },
    vendorId:{
        type:Schema.Types.ObjectId,
        ref : "Vendor",
        required: function(this:iUser){
            return  this.role==="vendorStaff";
        },
    },
    permissions: {
        type:[String],
        // required: true,
        default: [],
    },
    superAdmin:{
        type: Boolean,
        default:false,   
    },
    imageUrl: {
        type: String,
        // required: true,
    },
     isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Hide this field by default
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false, // Hide this field by default
    },
},
{   
    timestamps:true,
    toJSON:{virtuals: true},
    toObject:{virtuals: true},
}  
)

userSchema.pre<iUser>('save',async function (next) {
    if(!this.isModified('password') || !this.password) return next();    
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt)
        next();
    }catch(error:any){
        return next(error);
    }

});

userSchema.pre<Query<iUser,any>>(/^find/, function (next){
    
    try {
        if(this.getOptions().withDeleted === true) return next();
        this.where({isDeleted: {$ne: true}});
        next();
    } catch (err) {
         console.error("Error in pre-find middleware:", err);
        next();
    }
})

userSchema.virtual('fullImageUrl').get(function(){
    if(this.imageUrl){
        return `${process.env.BACKEND_URL}media/avatars/${this.imageUrl}`
    }
})

userSchema.methods.softDelete = async function (): Promise<void> {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();   
}

userSchema.methods.comparePassword = async function (password:string):Promise <boolean> {
    return await bcrypt.compare(password, this.password)
};


const User = model<iUser>("User",userSchema)

export default User;