import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs";
import sharp from "sharp";


export async function POST(req: Request) {
    const failedArr: string[] = [];
    const successArr: string[] = [];
    let inputFiles = 0;  
  try {
    const formData = await req.formData();
    
    //const files = formData.getAll
    //console.log(formData);
    const ro = formData.get("ro") as string;
    formData.delete("ro");
    try{
        if(!fs.existsSync(`${process.env.UPLOAD_DIR}${ro}`)){
            fs.mkdirSync(`${process.env.UPLOAD_DIR}${ro}`);
        }
    }catch(e){
        console.log("Error: " + e);
        return NextResponse.json({ status: "net" });
    }
    const files = formData.getAll("files") as File[];
    inputFiles = files.length;
    //console.log("Files:");
    //console.log(file);
    await Promise.all(
        files.map(async (file) => {
            try{
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            //sharp
            const arr = file.name.split(".");
            const fileType = arr[arr.length - 1];
            const fileName = arr[arr.length - 2];
            //console.log("file.name: " + file.name);
            //console.log("fileName: " + fileName);
            if(fileType === "jpg"){
                await fs.writeFileSync(`${process.env.UPLOAD_DIR}${ro}/${file.name}`, buffer);
                
            }else if(fileType === "jpeg"){
                await fs.writeFileSync(`${process.env.UPLOAD_DIR}${ro}/${fileName}.jpg`, buffer);
            }else{
                const newFile = await sharp(buffer).jpeg({quality: 100});
                await newFile.toFile(`${process.env.UPLOAD_DIR}${ro}/${fileName}.jpg`);
            }
            successArr.push(file.name);
        }catch(e){
            failedArr.push(file?.name);
            console.log("Error: " + e);
        }
            


            
        })
    );
    
    revalidatePath("/");
    if (failedArr.length === 0){
        return NextResponse.json({ status: "success", success: successArr });
    }
    else{
        return NextResponse.json({ status: "some", failed: failedArr, success: successArr });
    }

    
  } catch (e) {
    console.error(e);
    //TODO track files that failed and respond with which
    console.log(failedArr.length + " " + inputFiles);
    if(failedArr.length === inputFiles){
        return NextResponse.json({ status: "fail", error: e, failed: failedArr });
    }else{
        return NextResponse.json({ status: "some", failed: failedArr, success: successArr });
    }
        
  }
}