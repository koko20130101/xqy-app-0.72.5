import {createContext, useContext} from 'react';
import publicStore from './publicStore';
import deviceStore from './deviceStore';
import mediaStore from './mediaStore';
import homeStore from './homeStore';

const store = {
	publicStore,
	deviceStore,
	mediaStore,
	homeStore,
};

export const StoresContext = createContext(store);
export const useStores = () => useContext(StoresContext);
export default store;
