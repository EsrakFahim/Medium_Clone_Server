class apiResponse {
      constructor(statusCode, data, message = succuss) {
            this.statusCode = statusCode;
            this.data = data;
            this.message = message;
            this.succuss = statusCode >= 100 && statusCode < 500;
      }
}

export { apiResponse };
