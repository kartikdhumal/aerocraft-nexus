import { useReducer, createContext, useContext } from 'react';	
const initialState = {
	count: 0,
};

const countReducer = (state, action) => {
	switch (action.type) {
		case 'ADD':
			return { ...state, count: state.count + 1 };
		case 'REMOVE':
			return { ...state, count: state.count - 1 };
		case 'SET_COUNT':
			return { ...state, count: action.count };
		default:
			return state;
	}
};

const CountContext = createContext();
const CartContextProvider = ({ children }) => {
	const [state, dispatch] = useReducer(countReducer, initialState);

	const add = () => {
		dispatch({ type: 'ADD' });
	};

	const remove = () => {
		dispatch({ type: 'REMOVE' });
	};

	const setCount = (count) => {
		console.log(count)
		dispatch({ type: "SET_COUNT", count: count })
	}

	return (
		<CountContext.Provider value={{ count: state.count, add, remove, setCount }}>
			{children}
		</CountContext.Provider>
	);
};

const useCountContext = () => {
	return useContext(CountContext);
}

export { CartContextProvider, CountContext, useCountContext };