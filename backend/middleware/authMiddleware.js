import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
dotenv.config();
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

export default checkJwt;