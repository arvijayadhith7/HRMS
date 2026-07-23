import type { Request, Response } from 'express';
export declare const createFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllFeedback: (req: Request, res: Response) => Promise<void>;
export declare const updateFeedbackStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=feedback.controller.d.ts.map