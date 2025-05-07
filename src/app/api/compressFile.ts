import imageCompression from 'browser-image-compression';



const resize = async (file: File, options: object) => {

    try{
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file?.name);
        console.log(compressedFile?.name);
        return(compressedFile);
    }catch(e){
        console.log("Unable to compress, using original for " + file?.name);
        console.log("Error: ");
        console.log(e);
        return(file);
    }

}


export default resize;

