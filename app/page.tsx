"use client";
import {
  Paper,
  Container,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Modal,
  Box,
  Typography,
} from "@mui/material";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";

interface item {
  keycode: number;
  count: number;
}

export default function Home() {
  const [barcode, setBarcode] = useState<string>("");
  const [items, setItems] = useLocalStorage<item[]>("scannedItems", []);
  const barcodeInput = useRef<HTMLInputElement>(null);
  const [planogramData] = useLocalStorage<Planogram[]>("planogramData", []);

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(handleClose, 5000);
  }, []);
  const handleClose = () => setOpen(false);

  const [overlimitKeycode, setOverlimitKeycode] = useState<number | null>(null);

  const focusHandler = useCallback(() => {
    barcodeInput.current?.focus();
  }, []);

  const controlLimit = useCallback(
    (keycode: number, currentCount: number) => {
      const item = planogramData.find((x) => x.KEYCODE === keycode);
      if (item && item.FOH_QTY < currentCount) {
        setOverlimitKeycode(keycode);
        handleOpen();
        return false;
      }

      return true;
    },
    [handleOpen, planogramData]
  );

  const updateItems = useCallback(
    (keycode: number, amount: number) => {
      const existingItemIndex = items.findIndex((x) => x.keycode === keycode);
      if (existingItemIndex !== -1) {
        if (!controlLimit(keycode, items[existingItemIndex].count)) {
          setSuccess(false);
          return;
        }
        const updatedItems = [...items];
        updatedItems[existingItemIndex].count = updatedItems[existingItemIndex].count + amount;
        setItems(updatedItems);
      } else {
        setItems((prev) => [...prev, { keycode, count: amount }]);
      }
      setSuccess(true);
      handleOpen();
    },
    [controlLimit, handleOpen, items, setItems]
  );

  const barcodeInputHandler = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "Enter" && barcode.length >= 98) {
        const keycode = parseInt(barcode.slice(30, 38), 10);
        const amount = parseInt(barcode.slice(38, 41), 10);
        const multiplier = parseInt(barcode.slice(41, 44), 10);

        updateItems(keycode, amount * multiplier);
        setBarcode("");
      } else if (/^[0-9]$/.test(key)) {
        setBarcode((prevValue) => prevValue + key);
      }
    },
    [barcode, updateItems]
  );

  useEffect(() => {
    barcodeInput.current?.focus();
    window.addEventListener("focus", focusHandler);
    window.addEventListener("keydown", barcodeInputHandler);

    return () => {
      window.removeEventListener("focus", focusHandler);
      window.removeEventListener("keydown", barcodeInputHandler);
    };
  }, [focusHandler, barcodeInputHandler]);

  const tableRows = useMemo(
    () =>
      items.map((item: item, i: number) => {
        const row = planogramData.find((p) => p.KEYCODE === item.keycode) || {
          CURRENT_COUNT: item.count,
          KEYCODE: item.keycode,
          PRODUCT_DESCRIPTION: "",
          DEPARTMENT_DESCRIPTION: "",
          CLASS_DESCRIPTION: "",
          SUB_CLASS_DESCRIPTION: "",
          SUB_SUB_CLASS_DESCRIPTION: "",
          DAY_DATE: "",
          PLANOGRAM_UNITS: "",
          SOH_QTY: 0,
          FOH_QTY: 0,
          BOH_QTY: 0,
        };
        return (
          <TableRow
            key={i}
            sx={{
              "&:last-child td, &:last-child th": { border: 0 },
              backgroundColor: item.count > row.FOH_QTY ? (row.FOH_QTY === 0 ? "orange" : "red") : "",
            }}
          >
            <TableCell component="td" scope="row">
              {item.count}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.SOH_QTY}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.FOH_QTY}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.BOH_QTY}
            </TableCell>
            <TableCell component="td" scope="row">
              {item.keycode}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.PRODUCT_DESCRIPTION}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.DEPARTMENT_DESCRIPTION}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.CLASS_DESCRIPTION}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.SUB_CLASS_DESCRIPTION}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.SUB_SUB_CLASS_DESCRIPTION}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.DAY_DATE}
            </TableCell>
            <TableCell component="td" scope="row">
              {row.PLANOGRAM_UNITS}
            </TableCell>
          </TableRow>
        );
      }),
    [items, planogramData]
  );

  const resultModal = useMemo(() => {
    const modalStyle = {
      position: "absolute" as "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "95vw",
      height: "95vh",
      bgcolor: success ? "lime" : "red",
      border: "2px solid #000",
      boxShadow: 24,
      p: 4,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    };

    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {success ? (
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h1" component="h1" sx={{ textAlign: "center" }}>
              ACCEPTED
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center" }} component="h2" variant="h2">
              Keycode : {overlimitKeycode}
            </Typography>
          </Box>
        ) : (
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h1" component="h1" sx={{ textAlign: "center" }}>
              OVER LIMIT
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center" }} component="h3" variant="h3">
              Accepted limit exceeded for keycode : {overlimitKeycode}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center" }} component="h2" variant="h2">
              Please Put Red Sticker on Carton
            </Typography>
          </Box>
        )}
      </Modal>
    );
  }, [open, overlimitKeycode, success]);

  return (
    <>
      <Container maxWidth="xl" className="mt-4">
        <TextField
          label="Barcode"
          variant="standard"
          value={barcode}
          inputRef={barcodeInput}
          onBlur={() => barcodeInput.current?.focus()}
          sx={{ display: "none" }}
        />

        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>SCANNED</TableCell>
                <TableCell>SOH_QTY</TableCell>
                <TableCell>FOH_QTY</TableCell>
                <TableCell>BOH_QTY</TableCell>
                <TableCell>KEYCODE</TableCell>
                <TableCell>PRODUCT_DESCRIPTION</TableCell>
                <TableCell>DEPARTMENT_DESCRIPTION</TableCell>
                <TableCell>CLASS_DESCRIPTION</TableCell>
                <TableCell>SUB_CLASS_DESCRIPTION</TableCell>
                <TableCell>SUB_SUB_CLASS_DESCRIPTION</TableCell>
                <TableCell>DAY_DATE</TableCell>
                <TableCell>PLANOGRAM_UNITS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </TableContainer>
      </Container>
      {resultModal}
    </>
  );
}
