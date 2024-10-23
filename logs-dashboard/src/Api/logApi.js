import apiService from "../services/client";

const logAPiResponse = async () => {
    console.log("In api function")
    const response = await apiService('GET', 'https://logs-sse-api.onrender.com/logs/stream', null); 
    console.log("API response", response);
    return {
        data: response.data, 
        status: response.status,
    };
}

export default logAPiResponse;
