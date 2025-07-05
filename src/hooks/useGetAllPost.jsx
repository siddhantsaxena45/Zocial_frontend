import { useEffect } from "react";
import { useDispatch} from "react-redux";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { toast } from "sonner";

const useGetAllPost = () => {
    const dispatch = useDispatch();
   useEffect(() => {
     const fetchAllPost = async () => {
        try {
          const response = await axios.get("https://zocial-backend-m52y.onrender.com/api/v1/post/all",{withCredentials: true});
          if(response.data.success){
            
            dispatch(setPosts(response.data.posts))
          }
        } catch (error) {
          toast.error(error.response.data.message);
        }
      }
      fetchAllPost();
   }, [])
   

}

export default useGetAllPost