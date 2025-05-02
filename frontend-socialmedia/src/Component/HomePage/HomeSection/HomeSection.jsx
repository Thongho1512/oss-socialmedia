import React from "react";
import { Avatar } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import { useState } from "react";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import Button from "@mui/material/Button";
import TripleTCard from "./TripleTCard";

const validationSchema = Yup.object({
  content: Yup.string().required("TripleT text is Required"),
});
const HomeSection = () => {
  const [uploadingImage, setuploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleSubmit = (values) => {
    console.log("values", values);
  };
  const formik = useFormik({
    initialValues: {
      content: "",
      image: "",
    },
    onSubmit: handleSubmit,
    validationSchema,
  });
  const handleSelectImage = (event) => {
    setuploadingImage(true);
    const imgUrl = event.target.files[0];
    formik.setFieldValue("image", imgUrl);
    setSelectedImage(imgUrl);
    setuploadingImage(false);
  };

  return (
    <div className="space-y-5 ">
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
            <form onSubmit={formik.handleSubmit} action="">
              <div>
                <input
                  type="text"
                  name="content"
                  placeholder="What's happening?"
                  className={"border-none outline-non text-xl bg-transparent"}
                  {...formik.getFieldProps("content")}
                  {...(formik.errors.content && formik.touched.content && (
                    <span className="text-red-500 ">
                      {formik.errors.content}
                    </span>
                  ))}
                />
                <div className="flex justify-between items-center mt-5">
                  <div className="flex space-x-5 items-center">
                    <label className="flex item-center space-x-2 rounded-md cursor-pointer">
                      <ImageIcon
                        className="text-[#1d9bf0]"
                        onClick={() =>
                          document
                            .querySelector('input[name="imageFile"]')
                            .click()
                        }
                      />
                      <input
                        type="file"
                        name="imageFile"
                        className="hidden"
                        onChange={handleSelectImage}
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
                      >
                        TripleT
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
        {[1, 1, 1, 1, 1].map((item, index) => (
          <TripleTCard key={index} />
        ))}
      </section>
    </div>
  );
};

export default HomeSection;
