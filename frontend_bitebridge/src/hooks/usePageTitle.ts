import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTitle = (title:string)=>{
    const location = useLocation()
    useEffect(()=>{
        // const prevTitle = document.title;
        document.title = `${title} | BiteBridge`

    },[location,title])
}

export default usePageTitle