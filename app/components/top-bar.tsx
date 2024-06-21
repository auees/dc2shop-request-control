import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Upload from "./upload/upload";

export default function TopBar() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Upload />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Controller
          </Typography>
        </Toolbar>
      </AppBar>
    </>
  );
}
