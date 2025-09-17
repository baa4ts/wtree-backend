import jwt from 'jsonwebtoken';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: >
 *         Middleware `Auth` que valida el token JWT enviado
 *         en el header `Authorization: Bearer <token>`.
 *         Retorna:
 *           - 401 Unauthorized si no hay token
 *           - 403 Forbidden si el token es inválido
 *   responses:
 *     UnauthorizedError:
 *       description: Token requerido
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Token requerido
 *               token:
 *                 type: "null"
 *                 example: null
 *     ForbiddenError:
 *       description: Token inválido
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Token inválido
 *               token:
 *                 type: "null"
 *                 example: null
 */
export const Auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token requerido', token: null });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido', token: null });
  }
};
