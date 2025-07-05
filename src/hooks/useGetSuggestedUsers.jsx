import { useEffect } from "react";
import { useDispatch} from "react-redux";

import axios from "axios";
import { setSuggestedUsers } from "@/redux/authSlice";
import { toast } from "sonner";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
   useEffect(() => {
     const fetchSuggestedUsers = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/v1/user/suggested",{withCredentials: true});
          if(response.data.success){
            
            dispatch(setSuggestedUsers(response.data.users))
          }
        } catch (error) {
          toast.error(error.response.data.message);
        }
      }
      fetchSuggestedUsers();
   }, [])
   

}

export default useGetSuggestedUsers