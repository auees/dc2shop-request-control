/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { handleUpload } from "./upload-handler";
import { useFormStatus, useFormState } from "react-dom";
import { useEffect } from "react";
interface Props {
  open: boolean;
  handleClose: () => void;
  setPlanogramData: (data: Planogram[]) => void;
}

const initialState: { message: string; status: string; data?: string | undefined } = {
  message: "",
  status: "idle",
  data: "[]",
};

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" aria-disabled={pending}>
      Upload
    </Button>
  );
}

export default function UploadDialog({ open, handleClose, setPlanogramData }: Props) {
  const [state, formAction] = useFormState(handleUpload, initialState);

  useEffect(() => {
    if (state?.status === "ok" && state.data) {
      setPlanogramData(JSON.parse(state.data));
      handleClose();
    }
  }, [state]);
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          action: formAction,
        }}
      >
        <DialogTitle>Upload SOH File (.xlsx)</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="file"
            name="file"
            label="SOH File (.xlsx)"
            type="file"
            fullWidth
            variant="outlined"
          />
          {state?.status === "fail" && <p>{state.message}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <UploadButton />
        </DialogActions>
      </Dialog>
    </>
  );
}
