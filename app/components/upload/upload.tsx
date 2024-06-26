"use client";
import { useState } from "react";
import UploadIcon from "@mui/icons-material/UploadOutlined";
import { IconButton } from "@mui/material";
import UploadDialog from "./upload-dialog";

interface Props {
  setPlanogramData: (data: Planogram[]) => void;
  setUpdateDate: (data: Date) => void;
}

export default function Upload({ setPlanogramData, setUpdateDate }: Props) {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleClickOpen}>
        <UploadIcon />
      </IconButton>
      <UploadDialog
        handleClose={handleClose}
        open={open}
        setPlanogramData={setPlanogramData}
        setUpdateDate={setUpdateDate}
      />
    </>
  );
}
