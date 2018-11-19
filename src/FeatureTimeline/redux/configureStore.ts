import { createStore, applyMiddleware, Store, compose } from 'redux';
import { reducers, IFeatureTimelineRawState } from './store/types';
import createSagaMiddleware from 'redux-saga'
import { trackActions } from './sagas/trackActions';
import { watchSagaActions } from './sagas';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

export default function configureFeatureTimelineStore(
    initialState: IFeatureTimelineRawState
): Store<IFeatureTimelineRawState> {

    const sagaMonitor = window["__SAGA_MONITOR_EXTENSION__"] || undefined;
    const sagaMiddleWare = createSagaMiddleware({sagaMonitor});
    const middleware = applyMiddleware(sagaMiddleWare, trackActions);

    // Setup for using the redux dev tools in chrome 
    // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
    const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
    const persistConfig = {
        key: 'root',
        storage,
      }
      
    const persistedReducer = persistReducer(persistConfig, reducers)


    const store = createStore(
        persistedReducer,
        initialState, 
        composeEnhancers(middleware));

    sagaMiddleWare.run(watchSagaActions);
    return store;
}

