import React from "react";
import { Avatar, Button } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import { useState } from "react";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import TripleTCard from "./TripleTCard";
import axios from "axios";

const validationSchema = Yup.object({
  content: Yup.string().required("TripleT text is Required"),
});

const HomeSection = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSelectImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setPosting(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("caption", values.content);
      formData.append("privacy", true); // hoặc false nếu muốn public
      if (selectedImage) {
        formData.append("media", selectedImage);
      }
      const response = await axios.post(
        "http://localhost:8080/api/v1/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // "Content-Type": "multipart/form-data", // axios sẽ tự động set
          },
        }
      );
      console.log("API response:", response.data);
      if (response.data && response.data.Status === 200) {
        alert("Đăng bài thành công!");
        resetForm();
        setSelectedImage(null);
        setPreviewUrl("");
      } else {
        alert("Đăng bài thất bại!");
      }
    } catch (error) {
      alert("Đăng bài thất bại!");
      console.error(error);
    } finally {
      setPosting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      content: "",
    },
    onSubmit: handleSubmit,
    validationSchema,
  });

  return (
    <div className="space-y-5">
      <section className="">
        <h1 className="py-5 text-xl font-bold opacity-9">
          Welcome to the Home Page
        </h1>
      </section>
      <section className={"pb-10"}>
        <div className="flex space-x-5 ">
          <Avatar
            alt="username"
            src="https://yt3.ggpht.com/MKAbGjzzrPfP1n1NH9wNHSN9HR3dTugpNEpg5bBGvznkWKuGU5xPP7ckH0hBqGl4V3FEXH_B=s48-c-k-c0x00ffffff-no-rj"
          />
          <div className="w-full">
            <form onSubmit={formik.handleSubmit}>
              <div>
                <input
                  type="text"
                  name="content"
                  placeholder="What's happening?"
                  className={"border-none outline-non text-xl bg-transparent"}
                  {...formik.getFieldProps("content")}
                  disabled={posting}
                />
                {formik.errors.content && formik.touched.content && (
                  <span className="text-red-500">
                    {formik.errors.content}
                  </span>
                )}
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="preview" className="max-h-60 rounded-lg" />
                  </div>
                )}
                <div className="flex justify-between items-center mt-5">
                  <div className="flex space-x-5 items-center">
                    <label className="flex item-center space-x-2 rounded-md cursor-pointer">
                      <ImageIcon className="text-[#1d9bf0]" />
                      <input
                        type="file"
                        name="imageFile"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSelectImage}
                        disabled={posting}
                      />
                    </label>
                    <FmdGoodIcon className="text-[#1d9bf0]" />
                    <TagFacesIcon className="text-[#1d9bf0]" />
                    <div>
                      <Button
                        sx={{
                          width: "100%",
                          borderRadius: "20px",
                          paddingY: "8px",
                          paddingX: "20px",
                          bgcolor: "#1e88e5",
                        }}
                        variant="contained"
                        type="submit"
                        disabled={posting}
                      >
                        {posting ? "Posting..." : "TripleT"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <section>
        <TripleTCard />
      </section>
    </div>
  );
};

export default HomeSection;
