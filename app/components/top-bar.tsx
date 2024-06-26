"use client";
import React, { useMemo } from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import Upload from "./upload/upload";
import dayjs from "dayjs";
import { useLocalStorage } from "usehooks-ts";
export default function TopBar() {
  const [, , removeItems] = useLocalStorage("scannedItems", []);
  const [planogramData, setPlanogramData, removePlanogramData] = useLocalStorage<Planogram[]>("planogramData", []);
  const [updateDate, setUpdateDate, removeUpdateDate] = useLocalStorage<Date | null>("updateDate", null);
  function clearSiteData(): void {
    removeItems();
    removePlanogramData();
    removeUpdateDate();
  }

  const header = useMemo(() => {
    return (
      <Typography
        variant="subtitle1"
        component="div"
        sx={{
          flexGrow: 1,
          color:
            planogramData.length > 0 &&
            dayjs(updateDate).format("DD/MM/YYYY") === dayjs(new Date()).format("DD/MM/YYYY")
              ? "lime"
              : "orange",
        }}
      >
        {planogramData.length > 0
          ? `Planogram data loaded on ${dayjs(updateDate).format("DD/MM/YYYY")}`
          : "Please upload the planogram excel file!"}
      </Typography>
    );
  }, [planogramData, updateDate]);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Upload setPlanogramData={setPlanogramData} setUpdateDate={setUpdateDate} />
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
