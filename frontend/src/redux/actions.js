//actions.js
import { SET_LOGGED_IN_USER, SET_JWT_TOKEN } from './actionTypes';
export const setLoggedInUser = (username) => ({
    type: SET_LOGGED_IN_USER,
    payload: username,
  });


export const setJwtToken = (token) => ({
  type: SET_JWT_TOKEN,
  payload: token,
});
