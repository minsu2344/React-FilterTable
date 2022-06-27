import React, { Fragment, useState, useEffect } from "react";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector, Provider } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import UserTable from "./UserTable";

const checkboxes = [
  {
    id: "filterUsername",
    name: "filterUsername",
    pathFn: (user) => user.username,
    label: "Filter by Username",
  },

  {
    id: "filterCity",
    name: "filterCity",
    pathFn: (user) => user.address.city,
    label: "Filter by City",
  },

  {
    id: "filterCompany",
    name: "filterCompany",
    pathFn: (user) => user.company.name,
    label: "Filter by Company",
  },
];

const filterMap = {
  filterUsername: (user) => user.username,
  filterCity: (user) => user.address.city,
  filterCompany: (user) => user.company.name,
};

const filterFn = (filters, query) => (item) => {
  const filterFunctions = filters.map((filter) => filterMap[filter]);

  const filterItem = (data) =>
    filterFunctions.reduce((acc, fn) => {
      acc.push(fn(data));
      return acc;
    }, []);

  return filterItem(item).join().toLowerCase().search(query) !== -1;
};

const initialState = {
  filters: [],
  searchData: [],
  users: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    initializeSearchData(state, action) {
      state.searchData = action.payload;
      state.users = action.payload;
    },

    searchUsers(state, action) {
      const query = action.payload;
      const { searchData, filters } = state;

      if (!query) {
        state.users = searchData;
        return;
      }

      state.users = searchData.filter(filterFn(filters, query));
    },

    addFilter: {
      reducer: (state, action) => {
        state.filters.push(action.payload);
      },
    },

    removeFilter(state, action) {
      const index = state.filters.findIndex(
        (filter) => filter === action.payload
      );
      state.filters.splice(index, 1);
    },
  },
});

const {
  initializeSearchData,
  searchUsers,
  addFilter,
  removeFilter,
} = usersSlice.actions;

const reducer = usersSlice.reducer;

const store = configureStore({
  reducer,
});

export default function App() {
  return (
    <Provider store={store}>
      <UserTableApp />
    </Provider>
  );
}

const usersSelector = (state) => state.users;

function UserTableApp() {
  const dispatch = useDispatch();
  const users = useSelector(usersSelector);
  const [query, setQuery] = useState("");

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.data)
      .then((data) => dispatch(initializeSearchData(data)));
  }, [dispatch]);

  const handleReset = () => setQuery("");
  const handleChange = (e) => setQuery(e.target.value);

  useEffect(() => {
    dispatch(searchUsers(query));
  }, [dispatch, query]);

  const handleCheckboxChange = (pathFn) => (e) => {
    const name = e.target.name;
    if (e.target.checked) dispatch(addFilter(name));
    else dispatch(removeFilter(name));
    dispatch(searchUsers(query));
  };

  return (
    <Container>
      <div>
        <label htmlFor="search-query">Search</label>
        <input
          value={query}
          onChange={handleChange}
          id="search-query"
          type="text"
          name="search-query"
        />
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <CheckboxController>
        {checkboxes.map(({ id, name, pathFn, label }) => (
          <Fragment key={id}>
            <input
              type="checkbox"
              onChange={handleCheckboxChange(pathFn)}
              id={id}
              name={name}
            />
            <label htmlFor={id}>{label}</label>
          </Fragment>
        ))}
      </CheckboxController>

      <UserTable users={users} />
    </Container>
  );
}

const Container = styled.div`
  min-height: 600px;
`;

const CheckboxController = styled.div`
  padding: 8px 0;

  input:not(:first-of-type) {
    margin-left: 20px;
  }
`;
