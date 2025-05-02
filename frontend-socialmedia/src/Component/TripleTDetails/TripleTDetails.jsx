import React, { useEffect, useState } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TripleTCard from "./../HomeSection/TripleTCard";

const TripleTDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://localhost:8080/api/v1/posts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.data && response.data.Status === 200) {
          setPost(response.data.Data);
        }
      } catch (err) {
        setPost(null);
      }
    };
    fetchPost();
  }, [id]);

  const handleBack = () => navigate(-1);

  return (
    <React.Fragment>
      <section className="bg-white z-50 flex items-center sticky top-0 bg-opacity-95">
        <KeyboardBackspaceIcon
          className="cursor-pointer"
          onClick={handleBack}
        />
        <h1 className="py-5 text-xl font-bold opacity-90 ml-5">Post Details</h1>
      </section>
      <section>
        <TripleTCard post={post} />
      </section>
    </React.Fragment>
  );
};

export default TripleTDetails;
