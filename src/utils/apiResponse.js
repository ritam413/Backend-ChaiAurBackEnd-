class apiResponse {
    constructor(
        statuscode , data , message = "Success"
    ){
        this.statusCode =statusCode 
        this.data = data 
        this.message = message 
        this.success = statuscode < 400
    }
}

export { apiResponse }