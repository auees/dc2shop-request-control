"use client";
import { useState, useRef, useEffect, useMemo, useCallback, Suspense } from "react";
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
import { useLocalStorage, useIsClient } from "usehooks-ts";
interface Item {
  keycode: number;
  count: number;
}

export default function Home() {
  const [barcode, setBarcode] = useState<string>("");
  const [items, setItems] = useLocalStorage<Item[]>("scannedItems", []);
  const barcodeInput = useRef<HTMLInputElement>(null);
  const [planogramData] = useLocalStorage<Planogram[]>("planogramData", []);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState<number>(0);
  const [currentKeycode, setCurrentKeycode] = useState<number | null>(null);
  const isClient = useIsClient();

  const handleClose = useCallback(() => setOpen(false), []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(handleClose, 3000);
  }, [handleClose]);

  const focusHandler = useCallback(() => {
    barcodeInput.current?.focus();
  }, []);

  const updateItems = useCallback(
    (keycode: number, amount: number) => {
      setCurrentKeycode(keycode);
      setSuccess(2); // Accepted by default

      const pDefine = planogramData.find((x) => x.KEYCODE === keycode);
      // if (!pDefine) {
      //   setSuccess(1); // accepted
      // }

      const existingItemIndex = items.findIndex((x) => x.keycode === keycode);
      if (existingItemIndex !== -1) {
        // Check for limit if keycode is in planogram
        if (pDefine && pDefine.PREDICTED_BOH_QTY > 0 && pDefine.PREDICTED_BOH_QTY <= items[existingItemIndex].count) {
          setSuccess(1); // Over limit
          handleOpen();
          return;
        }

        const updatedItems = [...items];
        updatedItems[existingItemIndex].count += amount;
        setItems(updatedItems);
      } else {
        setItems((prev) => [...prev, { keycode, count: amount }]);
      }

      handleOpen();
    },
    [handleOpen, items, planogramData, setItems]
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

  const tableRows = useMemo(() => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell>No data</TableCell>
        </TableRow>
      );
    }

    return items.map((item: Item, i: number) => {
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
        PREDICTED_FOH_QTY: 0,
        PREDICTED_BOH_QTY: 0,
      };
      return (
        <TableRow
          key={i}
          sx={{
            "&:last-child td, &:last-child th": { border: 0 },
            backgroundColor: item.count > row.PREDICTED_BOH_QTY ? (row.PREDICTED_BOH_QTY === 0 ? "orange" : "red") : "",
          }}
        >
          <TableCell component="td" scope="row">
            {item.count}
          </TableCell>
          <TableCell component="td" scope="row">
            {row.SOH_QTY}
          </TableCell>
          <TableCell component="td" scope="row">
            {row.PREDICTED_FOH_QTY}
          </TableCell>
          <TableCell component="td" scope="row">
            {row.PREDICTED_BOH_QTY}
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
    });
  }, [items, planogramData]);

  const resultModal = useMemo(() => {
    const modalStyle = {
      position: "absolute" as "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "95vw",
      height: "95vh",
      color: "#fff",
      bgcolor: success === 0 ? "orange" : success === 1 ? "lime" : "red",
      border: "2px solid #000",
      boxShadow: 24,
      p: 4,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    };

    const renderModalContent = () => {
      if (success === 2) {
        return (
          <>
            <Typography id="modal-modal-title" variant="h1" component="h1" sx={{ textAlign: "center" }}>
              MARK PRODUCT
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center" }} component="h3" variant="h3">
              Keycode : {currentKeycode}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center" }} component="h2" variant="h2">
              Please Put Red Sticker on Carton!
            </Typography>
          </>
        );
      } else {
        return (
          <>
            <Typography id="modal-modal-title" variant="h1" component="h1" sx={{ textAlign: "center" }}>
              NO ACTION REQUIRED
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, textAlign: "center" }} component="h2" variant="h2">
              Keycode : {currentKeycode}
            </Typography>
          </>
        );
      }
    };

    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>{renderModalContent()}</Box>
      </Modal>
    );
  }, [open, currentKeycode, success, handleClose]);

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
                <TableCell>PREDICTED FOH_QTY</TableCell>
                <TableCell>PREDICTED BOH_QTY</TableCell>
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
            <TableBody>{isClient ? tableRows : null}</TableBody>
          </Table>
        </TableContainer>
      </Container>
      {resultModal}
    </>
  );
}
