import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";
import { toast } from "sonner";

const useGetAllMessages = () => {
  const dispatch = useDispatch();
  const selectedUser = useSelector((state) => state.auth.selectedUser);

  const fetchAllMessages = useCallback(async () => {
    if (!selectedUser?._id) return;
    try {
      const response = await axios.get(
        `https://zocial-backend-m52y.onrender.com/api/v1/message/all/${selectedUser._id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        dispatch(setMessages(response.data.messages));
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    fetchAllMessages();
  }, [fetchAllMessages]);

  return { refetch: fetchAllMessages };
};

export default useGetAllMessages;
