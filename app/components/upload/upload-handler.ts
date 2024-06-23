"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as XLSX from "xlsx";

export async function handleUpload(_: any, formData: FormData) {
  const schema = z.object({
    file: z.instanceof(File),
  });

  const parse = schema.safeParse({
    file: formData.get("file"),
  });

  if (!parse.success) {
    return { status: "fail", message: "Failed to upload file" };
  }

  const data = parse.data;

  revalidatePath("/");

  const planogramData = convertArrayBufferToJson(await data.file.arrayBuffer());
  return {
    status: "ok",
    message: `File uploaded! ${data.file.name}`,
    data: JSON.stringify(planogramData),
  };
}

const convertArrayBufferToJson = (arrayBuffer: ArrayBuffer): Planogram[] => {
  // Convert the ArrayBuffer to a Buffer
  const buffer = Buffer.from(arrayBuffer);

  // Read the buffer as an Excel workbook
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Get the specified sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON
  const jsonData = XLSX.utils.sheet_to_json<Planogram>(sheet, { dateNF: "iso" });

  return jsonData;
};
