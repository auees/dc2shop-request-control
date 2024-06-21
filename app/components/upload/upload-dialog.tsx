"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { handleUpload } from "./upload-handler";
import { useFormStatus, useFormState } from "react-dom";
import { useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
interface Props {
  open: boolean;
  handleClose: () => void;
}

const initialState: { message: string; status: string; data?: Planogram[] | undefined } = {
  message: "",
  status: "idle",
  data: [],
};

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" aria-disabled={pending}>
      Upload
    </Button>
  );
}

export default function UploadDialog({ open, handleClose }: Props) {
  const [state, formAction] = useFormState(handleUpload, initialState);
  const [planogramData, setPlanogramData] = useLocalStorage<Planogram[]>("planogramData", []);
  
  useEffect(() => {
    if (state?.status === "ok" && state.data) {
      setPlanogramData(state.data);
      handleClose();
    }
  }, [state, handleClose, setPlanogramData]);
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
