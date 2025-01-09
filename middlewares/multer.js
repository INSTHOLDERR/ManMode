import multer from "multer";

function uploader(fields) {
    const storage = multer.diskStorage({
        destination: "./uploads/uploaded-images", 
        filename: (req, file, cb) => {
            let date = new Date();
            let datePrefix = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getSeconds()}`;
            let timePrefix = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
            let randomPrefix = Math.floor(Math.random() * 10 ** 16);
            let splitName = file.originalname.split(".");
            let extention = splitName[splitName.length - 1];
            cb(null, datePrefix + "-" + timePrefix + "-" + randomPrefix + "." + extention);
        }
    });

    const upload = multer({ storage, limits: { fieldSize: 10 * 1024 * 1024 } });
    return upload.fields(fields); 
}

export default uploader;
