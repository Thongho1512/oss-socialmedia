import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";
import { Avatar, Button } from "@mui/material";
import { useFormik } from "formik";
import {
  Image as ImageIcon,
  FmdGood as FmdGoodIcon,
  TagFaces as TagFacesIcon,
} from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: 4,
  outline: "none",
  borderRadius: 4,
};

export default function ReplyModal({ handleClose, open }) {
  const navigate = useNavigate();
  const [uploadingImage, setuploadingImage] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState("");

  const handleSubmit = (values) => {
    console.log("handle submit", values);
  };
  const formik = useFormik({
    initialValues: {
      content: "",
      image: "",
      tripletId: 4,
    },
    onSubmit: handleSubmit,
  });
  const handleSelectImage = (event) => {
    setuploadingImage(true);
    const imgUrl = event.target.files[0];
    formik.setFieldValue("image", imgUrl);
    setSelectedImage(imgUrl);
    setuploadingImage(false);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="flex space-x-5">
            <Avatar
              onClick={() => navigate(`/profile/${6}`)}
              className="cursor-pointer"
              alt="username"
              src="https://yt3.ggpht.com/MKAbGjzzrPfP1n1NH9wNHSN9HR3dTugpNEpg5bBGvznkWKuGU5xPP7ckH0hBqGl4V3FEXH_B=s48-c-k-c0x00ffffff-no-rj"
            />
            <div className="w-full">
              <div className="flex justify-between item-center">
                <div className="flex cursor-pointer items-center space-x-2">
                  <span className="font-semibold">Thắng Gấp</span>
                  <span className="text-gray-600">@thanggap . 2m </span>
                </div>
              </div>
              <div className="mt-2">
                <div
                  onClick={() => navigate(`/triplet/${3}`)}
                  className="cursor-pointer"
                >
                  <p className=" mb-2 p-0 ">Reply S.t</p>
                </div>
              </div>
            </div>
          </div>
          <section className={`py-10`}>
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
                      className={
                        "border-none outline-non text-xl bg-transparent"
                      }
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
        </Box>
      </Modal>
    </div>
  );
}
