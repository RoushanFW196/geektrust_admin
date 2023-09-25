import React,{useState,useEffect} from 'react';
import axios from "axios";

const useFetch=()=>{











    return {data};
};





export const getApiCall=(url)=>{
    axios({
        method: 'get',
        url: url,
      })
        .then(function (response) {
           return response;
        }).catch(err=>console.log(err));

}



// export const getAPICall = async (url) => {
// 	let getHeaders = {}
	
// 		getHeaders['headers'] = {
// 			"CONTENT-TYPE": "application/json",
// 			"crossorigin": "true",
// 		}

	
// 	let callback = await axios.get(url, getHeaders);
// 	return callback['data'];
// }