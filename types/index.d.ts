// types/express/index.d.ts
import {TokenUser} from "~/auth/dto/tokens.dto";

declare global {
  namespace Express {
    interface Request {
      user?: TokenUser;
    }
  }
}
