
# Redux Saga Phase

Add typed phases to redux actions, use them in redux-saga and get typed, easy-to-read code that quickly connects via react hooks.

## Installation

Install my-project with npm

```bash
  npm install redux-saga-phase
```


### Phase Actions

Create typed
phase action functions are fast and readable.

```typescript
/* store/actions.ts */

import { createPhaseActions, phaseAction } from 'redux-saga-phase'
import * as types from 'src/api/objects/types';

export const prefix = `objects/sagas`

export const actions = createPhaseActions(prefix, {
  getSearch: phaseAction<{ search: string }>(),
  getList: phaseAction<types.IGetObjectsListParams>(),
  getItem: phaseAction<types.IGetObjectsItemParams>(),
  putItem: phaseAction<types.IPutObjectsItemParams>(),
  deleteItem: phaseAction<types.IDeleteObjectsItemParams>(),
})

export type Actions typeof actions;
```

Results:

```typescript
actions.getSearch.pending({ search: 'hi' })
// actions.getSearch.fulfilled()
// actions.getSearch.rejected()
// actions.getSearch.clear()
```
Retruns:
```typescript
{
  type: 'objects/sagas/getSearch/pending',
  payload: { search: 'hi' }
}
```


### Phase Sagas
Сreate typed action-based sagas.

#### Short variant
An example of a short usage, this simple option uses the ``takeLeading`` effect and will also handle exceptions.

```typescript
/* store/sagas.ts */

import { createSagas } from 'redux-saga-phase'
import { actions, Actions } from './actions'
import { setters } from './slise';
import { getObjectsSearch, IGetObjectsSearchResponse } from  'src/api/objects/types';

export const sagas = createSagas<Actions>(actions, {

  getSearch: function* ({ payload }) {
    const search:IGetObjectsSearchResponse = yield call(getObjectsSearch, payload);

    yield put(setters.setSearch(search.data))
  },

})


```

**if getObjectsSearch throws an exception, createPhaseSaga will catch that error and end the put action with type** ``.../rejected``
**and if there are no errors, run the action with type** ``.../fulfilled ``


```typescript
{
  type: 'objects/sagas/getSearch/rejected',
  error: Error
}
or
{
  type: 'objects/sagas/getSearch/fullfiled',
  payload: {}
}
```

#### Controled effect variants:

```typescript
export const sagas = createSagas<Actions>(actions, {

  getSearch:{
    effect: 'takeEvery' || (pattern, saga) => takeEvery(pattern, saga)
    task: function* ({ payload }) {
      const search:IGetObjectsSearchResponse = yield call(getObjectsSearch, payload);

      yield put(setters.setSearch(search.data))
    }
  },

})

```

#### Full phases variants:

```typescript
export const sagas = createSagas<Actions>(actions, {

  getSearch:{
    pending: {
      effect: (pattern, task) => throttle(1000, pattern, task)
      controled: false, // disabling exception interception and starting the fullfiled phase
      task: function* ({ payload }) {
        try {
          const search:IGetObjectsSearchResponse = yield call(getObjectsSearch, payload);
          yield put(actions.getSearch.fulfilled(search.data))
        } cetch (error){
          yield put(actions.getSearch.rejected(error))
        }
      }
    },
    }
    fulfilled: function* ({ payload }) {
        yield put(setters.setSearch(payload))
    },
    rejected: function* ({ error }) {
        yield put(setters.setSearch(undefined))
        yield put(setters.setSearchError(error.message))
    },
    clear: function* () {
      yield put(setters.setSearch(undefined))
    },
})

```

#### Added to redux state:

```typescript
import {
  TStatePhases,
  createStateSagaPhases,
} from 'redux-saga-phase'

import { Actions } from './actions';

export interface IStateData {}

export interface IState {
  data: IStateData
  phasesActions: TStatePhases<Actions>
}

export const getInitialData = (): IStateData => ({})

export const getInitialState = (): IState => ({
  data: getInitialData(),
  phasesActions: createStateSagaPhases(actions),
})

```

#### Added to redux slice:

```typescript
import { createSlice } from '@reduxjs/toolkit'
import {
  builderSagaPhases,
  clearAllStatePhases,
} from 'redux-saga-phase'

import { prefix, actions } from './actions';
import { initialState, IState } from './state';

const slice = createSlice({
  name: prefix,
  initialState: initialState,
  reducers: {
    setClear(state: IState) {
      state.data = moduleState.getInitialData()
      clearAllStatePhases(state.actionsPhases)
    },
  },
  extraReducers: (builder) => {
    builderSagaPhases<IState>(builder, actions)
  },
})
```

#### Added pase actions to selectors:

```typescript
import { createSelector } from 'reselect'
import { createPhasesSelectors } from 'redux-saga-phase'
import { prefix, actions } from './actions';
import { IState } from './state';

export const selectData = (state: IState): IState['data'] =>
    state[prefix].data

export const selectPhasesActions = (state: IState): IState['phasesActions'] =>
  state[prefix].phasesActions

export const selectorsPhases = createCommunicationSelectors<
  IState,
  IState['phasesActions'],
  typeof actions
>(selectPhasesActions, actions)

export const selectorsData = {
    search: createSelector(selectData, (state) => state.search),
    ...
}

export type TSelectorsData typeof selectorsData;

```


#### Create phase react hooks:

All declared types in actions will be used in react hooks.

```typescript
//* src/hooks/useObjects
import { createHooksActions, createHooksSelectors } from 'redux-saga-phase'
import { Actions, actions } from 'src/store/objects/actions'
import {
  selectorsPhases,
  selectorsData,
  TSelectorsData
} from 'src/store/objects/selectors'

export * from 'src/store/objects/state'

export const useObjectSelect = createHooksSelectors<TSelectorsData>(
  selectorsData
)

export const useObjectAction = createHooksActions<Actions>(
    actions,
    selectorsPhases
  )

```

Use only what is needed in a component to reduce the number of reconciliations.

You can run actions in one component, display data in another, and track states in a third.

```typescript
//* src/components/objectList
import React from 'react';
import { useObjectSelect, useObjectAction } from 'src/hooks/useObjects'

export const ObjectList = ()=> {
  const getObjectList = useObjectAction.objectsList()
  const getObjectListClear = useObjectAction.objectsList.clear()
  const getObjectListPhase = useObjectAction.objectsList.phase()
  const objectList = useObjectSelect.list()

  React.useEffect(()=>{
    getObjectList({ // phase run pending
      limit:20
    })

    return ()=> {
      getObjectListClear() // clear phase state
    }
  },[])

  return (
    <div>
      {getObjectListPhase.isPanding && (
        <div> loading... </div>
      )}

      {getObjectListPhase.isError && (
        <div> somthing wrong... </div>
      )}

      {getObjectListPhase.isFulfiled && (
        <div>
          {objectList.items.map(item => (
            <div key={item.id}> {item.name} </div>
          ))}
        </div>
      )}
    <div>
  )
}

```


