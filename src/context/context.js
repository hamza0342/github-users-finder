import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';


const GithubContext = React.createContext();

//Provider, Consumer

const GithubProvider = ({children}) => {
    const [GithubUser, setGithubUser] = useState(mockUser)
    const [GithubRepos, setGithubRepos] = useState(mockRepos)
    const [GithubFollowers, setGithubFollowers] = useState(mockFollowers)
    //Request Loading 
    const [requests, setRequests] = useState(0);
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({show: false, msg: ''});

    const searchGithubUser = async(user) => {
        //Toggle error
        toggleError()
        setLoading(true)
        const response = await axios(`${rootUrl}/users/${user}`).catch(err => console.log(err))
        if(response){
            setGithubUser(response.data)
            const {login, followers_url} = response.data
            axios(`${rootUrl}/users/${login}/repos?per_page=100`)
            .then(resp => {setGithubRepos(resp.data)})
            axios(`${followers_url}?per_page=100`)
            .then(resp => {setGithubFollowers(resp.data)})
            //More logic
            //Repos
            //https://api.github.com/users/john-smilga/repos?per_page=100
            //Followers
            //https://api.github.com/users/john-smilga/followers

        }
        else{
            toggleError(true, "There is no user with that username")
        }
        checkRequests()
        setLoading(false)
    }
    //Check rate
    const checkRequests = () => {
        axios(`${rootUrl}/rate_limit`).then(({data}) =>{
            let {rate:{remaining}} = data
            setRequests(remaining)
           
            if(remaining === 0){
                toggleError(true, "Sorry, You have run out of requests")
            }
           
        }).catch((err) => {
            console.log(err);
        })
    }
    function toggleError(show = false, msg = ''){
        setErrors({show, msg})
    }
    //Errors
    useEffect(checkRequests, [])
    
    return <GithubContext.Provider value={{GithubUser, GithubFollowers, GithubRepos, requests, errors, searchGithubUser, loading, setLoading}}>{children}</GithubContext.Provider>
}

const useGlobalContext = () => {

}


export {GithubProvider, GithubContext};