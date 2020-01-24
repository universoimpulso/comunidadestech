import multer from 'multer';
import multerConfig from '../config/multer';

class LogoController {
  async upload(req, res) {
    const { DEFAULT_LOGO } = process.env;
    // const { DEFAULT_LOGO, NODE_ENV, APP_URL } = process.env;
    // const isDev = NODE_ENV === 'development';
    const upload = multer(multerConfig).single('file');

    upload(req, res, function(err) {
      if (err) {
        return res.status(200).json({
          success: false,
          logo: DEFAULT_LOGO,
        });
      }

      const response = {
        success: true,
        // logo: isDev ? `${APP_URL}/files/${req.file.key}` : req.file.location,
        logo: req.file.location,
      };
      return res.json(response);
    });
  }
}

export default new LogoController();
