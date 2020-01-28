import jwt from 'jsonwebtoken';

class SessionController {
  login(req, res) {
    const { user, cookies } = req;
    if (!user)
      return res.status(500).json({ message: 'Error while authenticating' });

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '7 days',
      }
    );

    res.cookie(
      'ctech_credentials',
      JSON.stringify({
        token,
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        isModerator: user.isModerator,
      })
    );

    if (!!cookies.previousPage) res.clearCookie('previousPage');

    res.redirect(cookies.previousPage || '/');
  }

  checkError(req, res, next) {
    const { error } = req.query;

    if (!!error) return res.redirect('/');

    next();
  }

  checkToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({ error: 'Token not provided' });
      }
      const [, token] = authHeader.split(' ');

      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'invalid token' });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unable to decoded token' });
    }
  }
}

export default new SessionController();
