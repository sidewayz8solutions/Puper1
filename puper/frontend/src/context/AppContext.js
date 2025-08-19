import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const initialState = {
  selectedRestroom: null,
  mapCenter: null,
  filters: {
    wheelchair_accessible: false,
    baby_changing: false,
    gender_neutral: false,
    requires_fee: false,
    radius: 5000
  },
  searchQuery: '',
  showAddForm: false,
  showFilters: false
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_RESTROOM':
      return { ...state, selectedRestroom: action.payload };
    case 'SET_MAP_CENTER':
      return { ...state, mapCenter: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_ADD_FORM':
      return { ...state, showAddForm: !state.showAddForm };
    case 'TOGGLE_FILTERS':
      return { ...state, showFilters: !state.showFilters };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setSelectedRestroom = (restroom) => {
    dispatch({ type: 'SET_SELECTED_RESTROOM', payload: restroom });
  };

  const setMapCenter = (center) => {
    dispatch({ type: 'SET_MAP_CENTER', payload: center });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const toggleAddForm = () => {
    dispatch({ type: 'TOGGLE_ADD_FORM' });
  };

  const toggleFilters = () => {
    dispatch({ type: 'TOGGLE_FILTERS' });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const value = {
    ...state,
    setSelectedRestroom,
    setMapCenter,
    setFilters,
    setSearchQuery,
    toggleAddForm,
    toggleFilters,
    resetFilters
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
