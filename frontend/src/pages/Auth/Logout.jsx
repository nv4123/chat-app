import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import socket from "../../socket/socket";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logoutUser());
    socket.emit("offline");
    navigate("/login");
  }, [dispatch, navigate]);

  return null;
};

export default Logout;
