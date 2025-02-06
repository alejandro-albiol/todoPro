import { Request, Response } from 'express';

export interface IAuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
    initiatePasswordReset(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
}