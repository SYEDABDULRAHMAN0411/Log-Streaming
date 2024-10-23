import axios from 'axios';

const apiService = async (method, url, payload) => {
  console.log("IN service function")
    try {
        const requestConfigurations = {
            method, 
            url, 
            headers: {
                "Content-Type": 'application/json', 
            },
            data: payload, 
        };
        const response = await axios(requestConfigurations);
        return response; 
    } catch (error) {
        console.error('Error fetching logs:', error);
        return {
            data: null,
            status: error.response ? error.response.status : 500, 
        };
    }
};

export default apiService;
