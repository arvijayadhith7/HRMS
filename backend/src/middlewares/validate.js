import { ZodError } from 'zod';
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({ status: 'error', errors: e.issues });
            }
            return res.status(400).json({ status: 'error', message: 'Validation Error' });
        }
    };
};
//# sourceMappingURL=validate.js.map