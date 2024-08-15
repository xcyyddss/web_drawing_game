import { SET_LOGGED_IN_USER, SET_JWT_TOKEN } from './actionTypes';

const initialState = {
  username: '',
  jwtToken: '', // 新增JWT状态
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOGGED_IN_USER:
      return {
        ...state,
        username: action.payload,
      };
    case SET_JWT_TOKEN:
      return {
        ...state,
        jwtToken: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
