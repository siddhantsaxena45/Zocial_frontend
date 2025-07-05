import { useEffect } from "react";
import { useDispatch } from "react-redux";

import axios from "axios";
import { setUserProfile } from "@/redux/authSlice";
import { toast } from "sonner";

const useGetUserProfile = (userId) => {
  
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`https://zocial-backend-m52y.onrender.com/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (response.data.success) {

                    dispatch(setUserProfile(response.data.user))
                }
            } catch (error) {
                toast.error(error.response.data.message);
            }
        }
        fetchUserProfile();
    }, [userId])


}

export default useGetUserProfile