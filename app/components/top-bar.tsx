"use client";
import React, { useMemo } from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import Upload from "./upload/upload";

import { useLocalStorage } from "usehooks-ts";
export default function TopBar() {
  const [, , removeItems] = useLocalStorage("scannedItems", []);
  const [planogramData, setPlanogramData, removePlanogramData] = useLocalStorage<Planogram[]>("planogramData", []);
  function clearSiteData(): void {
    removeItems();
    removePlanogramData();
  }

  const header = useMemo(() => {
    return (
      <Typography
        variant="subtitle1"
        component="div"
        sx={{ flexGrow: 1, color: planogramData.length > 0 ? "lime" : "orange" }}
      >
        {planogramData.length > 0 ? "Planogram data loaded" : "Please upload the planogram excel file!"}
      </Typography>
    );
  }, [planogramData]);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Upload setPlanogramData={setPlanogramData} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Controller
          </Typography>
          {header}
          <Button variant="contained" color="error" onClick={() => clearSiteData()} aria-label="menu" sx={{ mr: 2 }}>
            Clear Data
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}
