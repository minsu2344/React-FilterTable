import React from 'react';
import "./App.css";
import UserTableApp from './UserTableApp/App'
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function App() {
  return (
    <Container>
      <UserTableApp />
    </Container>
  );
}

export default App;
