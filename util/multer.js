const multer = require('multer')
const path =require('path')

const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        if (file.fieldname !== 'image') {
          cb(null, './public/admin/assets/img/products')
        } else {
          cb(null, './public/admin/assets/img/products')
        }
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
      }
    
    })
      
    exports.upload = multer({ storage })