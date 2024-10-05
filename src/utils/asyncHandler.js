const asyncHandler = (fn) => {
      return (res, req, next) => {
            Promise.resolve(fn(res, req, next)).catch((error) => {
                  next(error);
            });
      };
};

export { asyncHandler };
