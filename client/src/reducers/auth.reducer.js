import {
  REGISTER_SUCCESS,
  REGISTER_ERROR,
  CLEAR_ERRORS,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  LOGIN_REQUEST,
} from './types';

export const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  trainer: null,
  error: null,
};

export const loginRequestAction = (user) => {
  return {
    type: LOGIN_REQUEST,
    payload: user,
  }
}

export const logoutRequestAction = () => {
  return {
    type: LOGOUT,
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        trainer: action.payload,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload);
      return {
        ...state,
        token: action.payload, // token
        isAuthenticated: false,
        loading: false,
      };
    case REGISTER_ERROR:
    case AUTH_ERROR:
    case LOGIN_ERROR:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        trainer: null,
        error: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export default reducer;
